import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

const RELATED_ENTITY_TABLES = {
  contact: "contacts",
  company: "companies",
  deal: "deals",
} as const;

type RelatedToValue = keyof typeof RELATED_ENTITY_TABLES;
type RelatedEntityDoc =
  | Doc<"contacts">
  | Doc<"companies">
  | Doc<"deals">;

const isRelatedToValue = (value: string): value is RelatedToValue =>
  value === "contact" || value === "company" || value === "deal";

const getRelatedEntity = async (
  ctx: QueryCtx | MutationCtx,
  relatedTo?: string,
  relatedId?: string,
): Promise<RelatedEntityDoc | null> => {
  if (!relatedTo || !relatedId || !isRelatedToValue(relatedTo)) {
    return null;
  }

  switch (RELATED_ENTITY_TABLES[relatedTo]) {
    case "contacts":
      return ctx.db.get(relatedId as Id<"contacts">);
    case "companies":
      return ctx.db.get(relatedId as Id<"companies">);
    case "deals":
      return ctx.db.get(relatedId as Id<"deals">);
    default:
      return null;
  }
};

// Get all tasks
export const getTasks = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    relatedTo: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    overdue: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasksQuery = ctx.db.query("tasks");

    // Apply filters
    if (args.status) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("status"), args.status),
      );
    }
    if (args.priority) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("priority"), args.priority),
      );
    }
    if (args.assignedTo) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("assignedTo"), args.assignedTo),
      );
    }
    if (args.relatedTo && args.relatedId) {
      tasksQuery = tasksQuery
        .filter((q) => q.eq(q.field("relatedTo"), args.relatedTo))
        .filter((q) => q.eq(q.field("relatedId"), args.relatedId));
    }

    let tasks = await tasksQuery.order("desc").collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.subject.toLowerCase().includes(searchLower) ||
          (task.description &&
            task.description.toLowerCase().includes(searchLower)),
      );
    }

    // Filter overdue tasks
    if (args.overdue) {
      const now = Date.now();
      tasks = tasks.filter(
        (task) => task.dueDate < now && task.status !== "completed",
      );
    }

    // Enrich with related entity data
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const relatedEntity = await getRelatedEntity(
          ctx,
          task.relatedTo,
          task.relatedId,
        );

        return {
          ...task,
          relatedEntity,
          isOverdue: task.dueDate < Date.now() && task.status !== "completed",
        };
      }),
    );

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    return {
      tasks: enrichedTasks.slice(offset, offset + limit),
      total: enrichedTasks.length,
      hasMore: offset + limit < enrichedTasks.length,
    };
  },
});

// Get tasks by assigned user
export const getTasksByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.userId))
      .collect();
  },
});

// Create new task
export const createTask = mutation({
  args: {
    subject: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.string(),
    status: v.optional(v.string()),
    assignedTo: v.string(),
    relatedTo: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    aiSuggested: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate related entity exists
    if (args.relatedTo && args.relatedId) {
      if (!isRelatedToValue(args.relatedTo)) {
        throw new Error(`Unsupported related type: ${args.relatedTo}`);
      }

      const relatedEntity = await getRelatedEntity(
        ctx,
        args.relatedTo,
        args.relatedId,
      );

      if (!relatedEntity) {
        throw new Error(`Related ${args.relatedTo} not found`);
      }
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      status: args.status || "not-started",
      createdAt: now,
      updatedAt: now,
    });

    // Create activity for task creation
    if (args.relatedTo && args.relatedId) {
      await ctx.db.insert("activities", {
        type: "note",
        subject: "Task Created",
        description: `New task assigned: ${args.subject}`,
        relatedTo: args.relatedTo,
        relatedId: args.relatedId,
        owner: args.assignedTo,
        createdAt: now,
      });
    }

    return taskId;
  },
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const now = Date.now();
    const updates: {
      status: string;
      updatedAt: number;
      completedAt?: number;
    } = {
      status: args.status,
      updatedAt: now,
    };

    // Set completion date if task is being completed
    if (args.status === "completed" && task.status !== "completed") {
      updates.completedAt = now;
    }

    await ctx.db.patch(args.id, updates);

    // Log status change activity
    if (task.relatedTo && task.relatedId) {
      await ctx.db.insert("activities", {
        type: "note",
        subject: "Task Status Updated",
        description: `Task "${task.subject}" status changed to ${args.status}`,
        relatedTo: task.relatedTo,
        relatedId: task.relatedId,
        owner: task.assignedTo,
        createdAt: now,
      });
    }

    return args.id;
  },
});

// Update task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    subject: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete task
export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const bulkUpdateTasks = mutation({
  args: {
    ids: v.array(v.id("tasks")),
    updates: v.object({
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      assignedTo: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    for (const id of args.ids) {
      const task = await ctx.db.get(id);
      if (task) {
        await ctx.db.patch(id, {
          ...args.updates,
          updatedAt: now,
        });
        results.push(id);
      }
    }

    return results;
  },
});

export const generateAITaskSuggestions = query({
  args: {
    relatedTo: v.string(),
    relatedId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get recent activities for the entity
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", args.relatedTo).eq("relatedId", args.relatedId),
      )
      .order("desc")
      .take(10);

    // Get existing tasks to avoid duplicates
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", args.relatedTo).eq("relatedId", args.relatedId),
      )
      .filter((q) => q.neq(q.field("status"), "completed"))
      .collect();

    const suggestions = [];

    // Analyze activities and suggest tasks
    const hasRecentCall = activities.some(
      (a) =>
        a.type === "call" && a.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000,
    );
    const hasRecentEmail = activities.some(
      (a) =>
        a.type === "email" &&
        a.createdAt > Date.now() - 3 * 24 * 60 * 60 * 1000,
    );
    const hasFollowUpTask = existingTasks.some((t) =>
      t.subject.toLowerCase().includes("follow"),
    );

    if (hasRecentCall && !hasFollowUpTask) {
      suggestions.push({
        subject: "Follow up on recent call",
        description:
          "Send follow-up email or schedule next meeting based on call discussion",
        priority: "medium",
        dueDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
      });
    }

    if (!hasRecentEmail && !hasFollowUpTask) {
      suggestions.push({
        subject: "Send check-in email",
        description:
          "Reach out to maintain engagement and check on current needs",
        priority: "low",
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
      });
    }

    // Deal-specific suggestions
    if (args.relatedTo === "deal") {
      const deal = await ctx.db.get(args.relatedId as Id<"deals">);
      if (deal && deal.stage === "proposal") {
        suggestions.push({
          subject: "Follow up on proposal",
          description:
            "Check if client has reviewed the proposal and address any questions",
          priority: "high",
          dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
        });
      }
    }

    return suggestions;
  },
});

export const getTasksSummary = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let tasksQuery = ctx.db.query("tasks");

    if (args.userId) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("assignedTo"), args.userId),
      );
    }

    const tasks = await tasksQuery.collect();
    const now = Date.now();

    const summary = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      overdueTasks: tasks.filter(
        (t) => t.dueDate < now && t.status !== "completed",
      ).length,
      dueTodayTasks: tasks.filter((t) => {
        const taskDate = new Date(t.dueDate).toDateString();
        const today = new Date().toDateString();
        return taskDate === today && t.status !== "completed";
      }).length,
      highPriorityTasks: tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed",
      ).length,
    };

    return summary;
  },
});
