import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { type UserRole } from "../lib/permissions";

// User roles
const USER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales",
  VIEWER: "viewer",
} as const;

// Role permissions matrix
export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: {
    canManageUsers: true,
    canManageBilling: true,
    canViewAllData: true,
    canEditAllData: true,
    canDeleteData: true,
    canManageSettings: true,
    canExportData: true,
  },
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canManageBilling: false,
    canViewAllData: true,
    canEditAllData: true,
    canDeleteData: true,
    canManageSettings: true,
    canExportData: true,
  },
  [USER_ROLES.MANAGER]: {
    canManageUsers: false,
    canManageBilling: false,
    canViewAllData: true,
    canEditAllData: true,
    canDeleteData: false,
    canManageSettings: false,
    canExportData: true,
  },
  [USER_ROLES.SALES]: {
    canManageUsers: false,
    canManageBilling: false,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canManageSettings: false,
    canExportData: false,
  },
  [USER_ROLES.VIEWER]: {
    canManageUsers: false,
    canManageBilling: false,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canManageSettings: false,
    canExportData: false,
  },
} as const;

// Create or update user from Clerk webhook
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const userData = {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      role: args.role || USER_ROLES.SALES, // Default role
      isActive: true,
      updatedAt: Date.now(),
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, userData);
      return existingUser._id;
    } else {
      return await ctx.db.insert("users", {
        ...userData,
        createdAt: Date.now(),
      });
    }
  },
});

// Get current user by Clerk ID
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get user by ID
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// update user role(admin/owner only)
export const updateUserRole = mutation({
  args: {
    clerkId: v.string(),
    targetUserId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    const permissions = ROLE_PERMISSIONS[currentUser.role as UserRole];

    if (!permissions.canManageUsers) {
      throw new ConvexError("You do not have permission to manage users");
    }

    if (
      args.newRole === USER_ROLES.OWNER &&
      currentUser.role !== USER_ROLES.OWNER
    ) {
      throw new ConvexError("Only owners can assign owner role");
    }

    await ctx.db.patch(args.targetUserId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
