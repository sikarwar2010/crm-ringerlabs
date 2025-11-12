import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all deals
export const getDeals = query({
  args: {
    search: v.optional(v.string()),
    stage: v.optional(v.string()),
    owner: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("deals");

    // Apply filters
    if (args.stage) {
      query = query.filter((q) => q.eq(q.field("stage"), args.stage));
    }
    if (args.owner) {
      query = query.filter((q) => q.eq(q.field("owner"), args.owner));
    }
    if (args.companyId) {
      query = query.filter((q) => q.eq(q.field("companyId"), args.companyId));
    }

    let deals = await query.order("desc").collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      deals = deals.filter((deal) =>
        deal.name.toLowerCase().includes(searchLower),
      );
    }

    // Enrich deals with company and contact information
    const enrichedDeals = await Promise.all(
      deals.map(async (deal) => {
        const company = await ctx.db.get(deal.companyId);
        const contact = deal.contactId
          ? await ctx.db.get(deal.contactId)
          : null;

        return {
          ...deal,
          company,
          contact,
        };
      }),
    );

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    return {
      deals: enrichedDeals.slice(offset, offset + limit),
      total: enrichedDeals.length,
      hasMore: offset + limit < enrichedDeals.length,
    };
  },
});

// Get deals by stage for Kanban board
export const getDealsByStage = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").collect();

    // Enrich with company data
    const enrichedDeals = await Promise.all(
      deals.map(async (deal) => {
        const company = await ctx.db.get(deal.companyId);
        const contact = deal.contactId
          ? await ctx.db.get(deal.contactId)
          : null;
        return { ...deal, company, contact };
      }),
    );

    // Group deals by stage and sort by AI probability
    const dealsByStage = enrichedDeals.reduce(
      (acc, deal) => {
        if (!acc[deal.stage]) {
          acc[deal.stage] = [];
        }
        acc[deal.stage].push(deal);
        return acc;
      },
      {} as Record<string, typeof enrichedDeals>,
    );

    // Sort each stage by AI probability (highest first)
    Object.keys(dealsByStage).forEach((stage) => {
      dealsByStage[stage].sort(
        (a, b) => (b.aiProbability || 0) - (a.aiProbability || 0),
      );
    });

    return dealsByStage;
  },
});

export const getDeal = query({
  args: { id: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.id);
    if (!deal) return null;

    const company = await ctx.db.get(deal.companyId);
    const contact = deal.contactId ? await ctx.db.get(deal.contactId) : null;

    // Get related activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "deal").eq("relatedId", args.id),
      )
      .order("desc")
      .take(10);

    // Get related tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "deal").eq("relatedId", args.id),
      )
      .collect();

    return {
      ...deal,
      company,
      contact,
      activities,
      tasks,
    };
  },
});

// Create new deal
export const createDeal = mutation({
  args: {
    name: v.string(),
    companyId: v.id("companies"),
    contactId: v.optional(v.id("contacts")),
    stage: v.string(),
    amount: v.number(),
    probability: v.number(),
    closeDate: v.number(),
    type: v.string(),
    owner: v.string(),
    leadSource: v.optional(v.string()),
    nextStep: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate company exists
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    // Calculate AI probability based on various factors
    let aiProbability = args.probability;

    // Adjust based on company health score
    if (company.healthScore) {
      aiProbability = (aiProbability + company.healthScore) / 2;
    }

    // Adjust based on deal amount (larger deals typically have lower probability)
    if (args.amount > 100000) aiProbability *= 0.9;
    if (args.amount > 500000) aiProbability *= 0.8;

    // Adjust based on lead source
    if (args.leadSource === "referral") aiProbability *= 1.2;
    if (args.leadSource === "cold-email") aiProbability *= 0.8;

    aiProbability = Math.min(Math.max(aiProbability, 0), 100);

    const now = Date.now();
    const dealId = await ctx.db.insert("deals", {
      ...args,
      aiProbability: Math.round(aiProbability),
      competitors: [],
      createdAt: now,
      updatedAt: now,
    });

    // Create initial activity
    await ctx.db.insert("activities", {
      type: "note",
      subject: "Deal Created",
      description: `New deal created: ${args.name} - $${args.amount.toLocaleString()}`,
      relatedTo: "deal",
      relatedId: dealId,
      owner: args.owner,
      createdAt: now,
    });

    return dealId;
  },
});

// Update deal stage (for Kanban drag & drop)
export const updateDealStage = mutation({
  args: {
    id: v.id("deals"),
    stage: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.id);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Update probability based on stage
    let newProbability = deal.probability;
    switch (args.stage) {
      case "prospecting":
        newProbability = 10;
        break;
      case "qualification":
        newProbability = 25;
        break;
      case "proposal":
        newProbability = 50;
        break;
      case "negotiation":
        newProbability = 75;
        break;
      case "closed-won":
        newProbability = 100;
        break;
      case "closed-lost":
        newProbability = 0;
        break;
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      stage: args.stage,
      probability: newProbability,
      updatedAt: now,
    });

    // Log stage change activity
    await ctx.db.insert("activities", {
      type: "note",
      subject: "Deal Stage Updated",
      description: `Deal moved to ${args.stage} stage`,
      relatedTo: "deal",
      relatedId: args.id,
      owner: deal.owner,
      createdAt: now,
    });

    return args.id;
  },
});

// Update deal
export const updateDeal = mutation({
  args: {
    id: v.id("deals"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
    probability: v.optional(v.number()),
    closeDate: v.optional(v.number()),
    stage: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    competitors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const deal = await ctx.db.get(id);

    if (!deal) {
      throw new Error("Deal not found");
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });

    // Log significant changes
    const changes = [];
    if (updates.amount && updates.amount !== deal.amount) {
      changes.push(
        `Amount: $${deal.amount?.toLocaleString()} → $${updates.amount.toLocaleString()}`,
      );
    }
    if (updates.stage && updates.stage !== deal.stage) {
      changes.push(`Stage: ${deal.stage} → ${updates.stage}`);
    }
    if (updates.closeDate && updates.closeDate !== deal.closeDate) {
      changes.push(
        `Close Date: ${new Date(deal.closeDate).toLocaleDateString()} → ${new Date(updates.closeDate).toLocaleDateString()}`,
      );
    }

    if (changes.length > 0) {
      await ctx.db.insert("activities", {
        type: "note",
        subject: "Deal Updated",
        description: `Deal changes: ${changes.join(", ")}`,
        relatedTo: "deal",
        relatedId: id,
        owner: deal.owner,
        createdAt: now,
      });
    }

    return id;
  },
});

// Delete deal
export const deleteDeal = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.id);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Delete related activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "deal").eq("relatedId", args.id),
      )
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Delete related tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "deal").eq("relatedId", args.id),
      )
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete the deal
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const updateAIProbability = mutation({
  args: {
    id: v.id("deals"),
    recentActivities: v.optional(v.number()),
    emailEngagement: v.optional(v.number()),
    competitorCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.id);
    if (!deal) {
      throw new Error("Deal not found");
    }

    let newProbability = deal.aiProbability || deal.probability;

    // Adjust based on recent activity
    if (args.recentActivities) {
      newProbability += args.recentActivities * 5;
    }

    // Adjust based on email engagement
    if (args.emailEngagement) {
      newProbability += args.emailEngagement * 3;
    }

    // Adjust based on competition
    if (args.competitorCount) {
      newProbability -= args.competitorCount * 5;
    }

    newProbability = Math.min(Math.max(newProbability, 0), 100);

    await ctx.db.patch(args.id, {
      aiProbability: Math.round(newProbability),
      updatedAt: Date.now(),
    });

    return newProbability;
  },
});

export const getDealsSummary = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").collect();

    const summary = {
      totalDeals: deals.length,
      totalValue: deals.reduce((sum, deal) => sum + deal.amount, 0),
      openDeals: deals.filter((deal) => !deal.stage.includes("closed")).length,
      wonDeals: deals.filter((deal) => deal.stage === "closed-won").length,
      lostDeals: deals.filter((deal) => deal.stage === "closed-lost").length,
      averageDealSize:
        deals.length > 0
          ? deals.reduce((sum, deal) => sum + deal.amount, 0) / deals.length
          : 0,
      winRate:
        deals.length > 0
          ? (deals.filter((deal) => deal.stage === "closed-won").length /
              deals.filter((deal) => deal.stage.includes("closed")).length) *
            100
          : 0,
    };

    return summary;
  },
});
