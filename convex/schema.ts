import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.string(), // "owner", "admin", "manager", "sales", "viewer"
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
  contacts: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    notes: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    leadSource: v.optional(v.string()),
    status: v.string(), // "new", "contacted", "qualified", "unqualified"
    rating: v.string(), // "hot", "warm", "cold"
    owner: v.string(), // user ID
    aiScore: v.optional(v.number()),
    sentiment: v.optional(v.string()), // "positive", "neutral", "negative"
    lastActivity: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"])
    .index("by_notes", ["notes"]),

  // companies Accounts table
  companies: defineTable({
    name: v.string(),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    employees: v.optional(v.number()),
    annualRevenue: v.optional(v.number()),
    type: v.string(), // "customer", "prospect", "partner"
    healthScore: v.optional(v.number()),
    owner: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_owner", ["owner"])
    .index("by_type", ["type"]),
  // Deals (Opportunities) table
  deals: defineTable({
    name: v.string(),
    companyId: v.id("companies"),
    contactId: v.optional(v.id("contacts")),
    stage: v.string(), // "prospecting", "qualification", "proposal", "negotiation", "closed-won", "closed-lost"
    amount: v.number(),
    probability: v.number(),
    aiProbability: v.optional(v.number()),
    closeDate: v.number(),
    type: v.string(), // "new", "renewal", "expansion", "upsell"
    leadSource: v.optional(v.string()),
    owner: v.string(),
    nextStep: v.optional(v.string()),
    competitors: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_contact", ["contactId"])
    .index("by_owner", ["owner"])
    .index("by_stage", ["stage"])
    .index("by_close_date", ["closeDate"]),
  // Tasks table
  tasks: defineTable({
    subject: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.string(), // "high", "medium", "low"
    status: v.string(), // "not-started", "in-progress", "completed", "deferred"
    assignedTo: v.string(),
    relatedTo: v.optional(v.string()), // "contact", "company", "deal"
    relatedId: v.optional(v.string()),
    aiSuggested: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_assigned_to", ["assignedTo"])
    .index("by_due_date", ["dueDate"])
    .index("by_status", ["status"])
    .index("by_related", ["relatedTo", "relatedId"]),
  // Activities table (calls, emails, meetings)
  activities: defineTable({
    type: v.string(), // "call", "email", "meeting", "note"
    subject: v.string(),
    description: v.optional(v.string()),
    duration: v.optional(v.number()), // in minutes
    outcome: v.optional(v.string()),
    relatedTo: v.string(), // "contact", "company", "deal"
    relatedId: v.string(),
    owner: v.string(),
    aiSummary: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_related", ["relatedTo", "relatedId"])
    .index("by_owner", ["owner"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),
  // Pipeline stages configuration
  pipelineStages: defineTable({
    name: v.string(),
    order: v.number(),
    probability: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),
  // AI Reports table
  aiReports: defineTable({
    query: v.string(),
    summary: v.optional(v.string()),
    userId: v.string(),
    status: v.string(), // "processing", "completed", "failed"
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Company Settings table
  companySettings: defineTable({
    companyName: v.optional(v.string()),
    subdomain: v.optional(v.string()),
    industry: v.optional(v.string()),
    timezone: v.optional(v.string()),
    description: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    realTimeUpdates: v.optional(v.boolean()),
    weeklyReports: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  // Team Invitations table
  invitations: defineTable({
    email: v.string(),
    role: v.string(),
    invitedBy: v.string(),
    status: v.string(), // "pending", "accepted", "expired", "cancelled"
    token: v.optional(v.string()),
    customPermissions: v.optional(v.string()), // JSON string of custom permissions
    personalMessage: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_token", ["token"]),

  // AI Settings table
  aiSettings: defineTable({
    leadScoring: v.optional(v.boolean()),
    dealPredictions: v.optional(v.boolean()),
    sentimentAnalysis: v.optional(v.boolean()),
    smartSuggestions: v.optional(v.boolean()),
    reportGeneration: v.optional(v.boolean()),
    modelProvider: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    monthlyQueries: v.optional(v.number()),
    predictionAccuracy: v.optional(v.number()),
    monthlyCosts: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Security Settings table
  securitySettings: defineTable({
    twoFactorEnabled: v.optional(v.boolean()),
    ssoEnabled: v.optional(v.boolean()),
    sessionTimeout: v.optional(v.string()),
    dataRetention: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
