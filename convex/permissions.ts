import { v } from "convex/values";
import { query } from "./_generated/server";

// Module definitions for granular access control
export const MODULES = {
  DASHBOARD: "dashboard",
  CONTACTS: "contacts",
  COMPANIES: "companies",
  DEALS: "deals",
  TASKS: "tasks",
  REPORTS: "reports",
  SETTINGS: "settings",
  TEAM: "team",
  BILLING: "billing",
  AI_FEATURES: "ai_features",
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

// Action types for each module
export const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  EXPORT: "export",
  MANAGE: "manage", // For settings/admin actions
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// Enhanced role permissions with module-level access
export const ENHANCED_ROLE_PERMISSIONS = {
  owner: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.CONTACTS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.EXPORT,
    ],
    [MODULES.COMPANIES]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.EXPORT,
    ],
    [MODULES.DEALS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.EXPORT,
    ],
    [MODULES.TASKS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
    ],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EXPORT],
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.MANAGE],
    [MODULES.TEAM]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.MANAGE,
    ],
    [MODULES.BILLING]: [ACTIONS.VIEW, ACTIONS.MANAGE],
    [MODULES.AI_FEATURES]: [ACTIONS.VIEW, ACTIONS.MANAGE],
  },
  admin: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.CONTACTS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.EXPORT,
    ],
    [MODULES.COMPANIES]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.EXPORT,
    ],
    [MODULES.DEALS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.EXPORT,
    ],
    [MODULES.TASKS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
    ],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EXPORT],
    [MODULES.SETTINGS]: [ACTIONS.VIEW, ACTIONS.MANAGE],
    [MODULES.TEAM]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.MANAGE,
    ],
    [MODULES.BILLING]: [ACTIONS.VIEW],
    [MODULES.AI_FEATURES]: [ACTIONS.VIEW, ACTIONS.MANAGE],
  },
  manager: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.CONTACTS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.EXPORT,
    ],
    [MODULES.COMPANIES]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.EXPORT,
    ],
    [MODULES.DEALS]: [
      ACTIONS.VIEW,
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.EXPORT,
    ],
    [MODULES.TASKS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EXPORT],
    [MODULES.SETTINGS]: [ACTIONS.VIEW],
    [MODULES.TEAM]: [ACTIONS.VIEW],
    [MODULES.BILLING]: [],
    [MODULES.AI_FEATURES]: [ACTIONS.VIEW],
  },
  sales: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.CONTACTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.COMPANIES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.DEALS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.TASKS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.REPORTS]: [ACTIONS.VIEW],
    [MODULES.SETTINGS]: [],
    [MODULES.TEAM]: [],
    [MODULES.BILLING]: [],
    [MODULES.AI_FEATURES]: [ACTIONS.VIEW],
  },
  viewer: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.CONTACTS]: [ACTIONS.VIEW],
    [MODULES.COMPANIES]: [ACTIONS.VIEW],
    [MODULES.DEALS]: [ACTIONS.VIEW],
    [MODULES.TASKS]: [ACTIONS.VIEW],
    [MODULES.REPORTS]: [ACTIONS.VIEW],
    [MODULES.SETTINGS]: [],
    [MODULES.TEAM]: [],
    [MODULES.BILLING]: [],
    [MODULES.AI_FEATURES]: [],
  },
} as const;

// Check if user has permission for specific module and action
export const checkModulePermission = query({
  args: {
    clerkId: v.string(),
    module: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.isActive) {
      return false;
    }

    const rolePermissions =
      ENHANCED_ROLE_PERMISSIONS[
        user.role as keyof typeof ENHANCED_ROLE_PERMISSIONS
      ];
    if (!rolePermissions) {
      return false;
    }

    const modulePermissions = rolePermissions[args.module as Module] as readonly Action[] | undefined;
    return modulePermissions?.includes(args.action as Action) || false;
  },
});

// Get all permissions for a user
export const getUserPermissions = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.isActive) {
      return null;
    }

    return {
      user,
      permissions:
        ENHANCED_ROLE_PERMISSIONS[
          user.role as keyof typeof ENHANCED_ROLE_PERMISSIONS
        ] || {},
    };
  },
});
