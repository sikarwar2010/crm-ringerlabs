import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCompanies = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    industry: v.optional(v.string()),
    owner: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("companies");

    // Apply filters
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    if (args.industry) {
      query = query.filter((q) => q.eq(q.field("industry"), args.industry));
    }
    if (args.owner) {
      query = query.filter((q) => q.eq(q.field("owner"), args.owner));
    }

    let results = await query.order("desc").collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      results = results.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          (company.industry &&
            company.industry.toLowerCase().includes(searchLower)),
      );
    }

    // Get related data for each company
    const companiesWithData = await Promise.all(
      results.map(async (company) => {
        const contacts = await ctx.db
          .query("contacts")
          .filter((q) => q.eq(q.field("company"), company.name))
          .collect();

        const deals = await ctx.db
          .query("deals")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .collect();

        const activeDeals = deals.filter(
          (deal) => !deal.stage.includes("closed"),
        );

        const totalDealValue = activeDeals.reduce(
          (sum, deal) => sum + deal.amount,
          0,
        );

        return {
          ...company,
          contactCount: contacts.length,
          activeDealCount: activeDeals.length,
          totalDealValue,
        };
      }),
    );

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    return {
      companies: companiesWithData.slice(offset, offset + limit),
      total: companiesWithData.length,
      hasMore: offset + limit < companiesWithData.length,
    };
  },
});

export const getCompany = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) return null;

    // Get all related contacts
    const contacts = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("company"), company.name))
      .collect();

    // Get all related deals
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_company", (q) => q.eq("companyId", args.id))
      .collect();

    // Get recent activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "company").eq("relatedId", args.id),
      )
      .order("desc")
      .take(20);

    // Calculate health metrics
    const activeDeals = deals.filter((deal) => !deal.stage.includes("closed"));
    const wonDeals = deals.filter((deal) => deal.stage === "closed-won");
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const pipelineValue = activeDeals.reduce(
      (sum, deal) => sum + deal.amount,
      0,
    );

    return {
      ...company,
      contacts,
      deals,
      activities,
      metrics: {
        totalRevenue,
        pipelineValue,
        activeDeals: activeDeals.length,
        wonDeals: wonDeals.length,
        contactCount: contacts.length,
      },
    };
  },
});

export const createCompany = mutation({
  args: {
    name: v.string(),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    employees: v.optional(v.number()),
    annualRevenue: v.optional(v.number()),
    type: v.string(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate company name
    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingCompany) {
      throw new Error("Company with this name already exists");
    }

    const now = Date.now();

    // Calculate initial health score
    let healthScore = 50;
    if (args.annualRevenue && args.annualRevenue > 1000000) healthScore += 20;
    if (args.employees && args.employees > 100) healthScore += 15;
    if (args.website) healthScore += 10;

    const companyId = await ctx.db.insert("companies", {
      ...args,
      healthScore: Math.min(healthScore, 100),
      createdAt: now,
      updatedAt: now,
    });

    // Create initial activity
    await ctx.db.insert("activities", {
      type: "note",
      subject: "Company Created",
      description: `New company added to CRM: ${args.name}`,
      relatedTo: "company",
      relatedId: companyId,
      owner: args.owner,
      createdAt: now,
    });

    return companyId;
  },
});

export const updateCompany = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    employees: v.optional(v.number()),
    annualRevenue: v.optional(v.number()),
    type: v.optional(v.string()),
    owner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const company = await ctx.db.get(id);

    if (!company) {
      throw new Error("Company not found");
    }

    // Check for name conflicts if name is being updated
    if (updates.name && updates.name !== company.name) {
      const existingCompany = await ctx.db
        .query("companies")
        .withIndex("by_name", (q) => q.eq("name", updates.name ?? company.name))
        .first();

      if (existingCompany && existingCompany._id !== id) {
        throw new Error("Company with this name already exists");
      }
    }

    // Recalculate health score if relevant fields changed
    let healthScore = company.healthScore || 50;
    if (
      updates.annualRevenue !== undefined ||
      updates.employees !== undefined
    ) {
      const revenue = updates.annualRevenue ?? company.annualRevenue;
      const employees = updates.employees ?? company.employees;

      healthScore = 50;
      if (revenue && revenue > 1000000) healthScore += 20;
      if (employees && employees > 100) healthScore += 15;
      if (company.website || updates.website) healthScore += 10;
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      healthScore,
      updatedAt: now,
    });

    // Update related contacts if company name changed
    if (updates.name && updates.name !== company.name) {
      const contacts = await ctx.db
        .query("contacts")
        .filter((q) => q.eq(q.field("company"), company.name))
        .collect();

      for (const contact of contacts) {
        await ctx.db.patch(contact._id, {
          company: updates.name,
          updatedAt: now,
        });
      }
    }

    return id;
  },
});

export const deleteCompany = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) {
      throw new Error("Company not found");
    }

    // Delete related activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_related", (q) =>
        q.eq("relatedTo", "company").eq("relatedId", args.id),
      )
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Delete related deals
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_company", (q) => q.eq("companyId", args.id))
      .collect();

    for (const deal of deals) {
      await ctx.db.delete(deal._id);
    }

    // Update related contacts to remove company reference
    const contacts = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("company"), company.name))
      .collect();

    for (const contact of contacts) {
      await ctx.db.patch(contact._id, { company: undefined });
    }

    // Delete the company
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const updateHealthScore = mutation({
  args: {
    id: v.id("companies"),
    dealActivity: v.optional(v.number()),
    communicationFrequency: v.optional(v.number()),
    paymentHistory: v.optional(v.string()), // "good", "fair", "poor"
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) {
      throw new Error("Company not found");
    }

    let newScore = company.healthScore || 50;

    if (args.dealActivity) {
      newScore += args.dealActivity * 10;
    }
    if (args.communicationFrequency) {
      newScore += args.communicationFrequency * 5;
    }
    if (args.paymentHistory) {
      switch (args.paymentHistory) {
        case "good":
          newScore += 15;
          break;
        case "fair":
          newScore += 5;
          break;
        case "poor":
          newScore -= 10;
          break;
      }
    }

    newScore = Math.max(0, Math.min(newScore, 100));

    await ctx.db.patch(args.id, {
      healthScore: newScore,
      updatedAt: Date.now(),
    });

    return newScore;
  },
});
