import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    owner: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("contacts");

    // Apply filters
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.sentiment) {
      query = query.filter((q) => q.eq(q.field("sentiment"), args.sentiment));
    }
    if (args.owner) {
      query = query.filter((q) => q.eq(q.field("owner"), args.owner));
    }

    let results = await query.order("desc").collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      results = results.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(searchLower) ||
          contact.lastName.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          (contact.company &&
            contact.company.toLowerCase().includes(searchLower)),
      );
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    return {
      contacts: results.slice(offset, offset + limit),
      total: results.length,
      hasMore: offset + limit < results.length,
    };
  },
});

export const getContact = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) return null;

    // Get related activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "contact").eq("relatedId", args.id),
      )
      .order("desc")
      .take(10);

    // Get related deals
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    return {
      ...contact,
      activities,
      deals,
    };
  },
});

export const createContact = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    leadSource: v.optional(v.string()),
    status: v.optional(v.string()),
    rating: v.optional(v.string()),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate email
    const existingContact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingContact) {
      throw new Error("Contact with this email already exists");
    }

    const now = Date.now();

    // Calculate AI score based on lead source and company
    let aiScore = 50; // Base score
    if (args.leadSource === "referral") aiScore += 20;
    if (args.leadSource === "website") aiScore += 15;
    if (args.company) aiScore += 10;
    if (
      args.title?.toLowerCase().includes("ceo") ||
      args.title?.toLowerCase().includes("cto")
    )
      aiScore += 15;

    const contactId = await ctx.db.insert("contacts", {
      ...args,
      status: args.status || "new",
      rating: args.rating || "cold",
      aiScore: Math.min(aiScore + Math.floor(Math.random() * 20), 100),
      sentiment: "neutral",
      lastActivity: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial activity
    await ctx.db.insert("activities", {
      type: "note",
      subject: "Contact Created",
      description: `New contact added to CRM from ${args.leadSource || "unknown source"}`,
      relatedTo: "contact",
      relatedId: contactId,
      owner: args.owner,
      createdAt: now,
    });

    return contactId;
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
    rating: v.optional(v.string()),
    owner: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const contact = await ctx.db.get(id);

    if (!contact) {
      throw new Error("Contact not found");
    }

    // Check for email conflicts if email is being updated
    if (updates.email && updates.email !== contact.email) {
      const existingContact = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existingContact && existingContact._id !== id) {
        throw new Error("Contact with this email already exists");
      }
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
      lastActivity: now,
    });

    // Log update activity (only if notes changed, don't log for notes updates)
    if (Object.keys(updates).some(key => key !== "notes")) {
      const changedFields = Object.keys(updates).filter(key => key !== "notes").join(", ");
      await ctx.db.insert("activities", {
        type: "note",
        subject: "Contact Updated",
        description: `Contact information updated: ${changedFields}`,
        relatedTo: "contact",
        relatedId: id,
        owner: contact.owner,
        createdAt: now,
      });
    }

    return id;
  },
});

export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Delete related activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "contact").eq("relatedId", args.id),
      )
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Update related deals to remove contact reference
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    for (const deal of deals) {
      await ctx.db.patch(deal._id, { contactId: undefined });
    }

    // Delete the contact
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const bulkUpdateContacts = mutation({
  args: {
    ids: v.array(v.id("contacts")),
    updates: v.object({
      status: v.optional(v.string()),
      rating: v.optional(v.string()),
      owner: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    for (const id of args.ids) {
      const contact = await ctx.db.get(id);
      if (contact) {
        await ctx.db.patch(id, {
          ...args.updates,
          updatedAt: now,
          lastActivity: now,
        });
        results.push(id);
      }
    }

    return results;
  },
});

export const updateAIScore = mutation({
  args: {
    id: v.id("contacts"),
    interactions: v.optional(v.number()),
    emailOpens: v.optional(v.number()),
    websiteVisits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Calculate new AI score based on engagement
    let newScore = contact.aiScore || 50;
    if (args.interactions) newScore += args.interactions * 5;
    if (args.emailOpens) newScore += args.emailOpens * 2;
    if (args.websiteVisits) newScore += args.websiteVisits * 3;

    // Cap at 100
    newScore = Math.min(newScore, 100);

    await ctx.db.patch(args.id, {
      aiScore: newScore,
      updatedAt: Date.now(),
    });

    return newScore;
  },
});

export const getContactsByCompany = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("company"), args.companyName))
      .collect();
  },
});
