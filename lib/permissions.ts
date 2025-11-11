export type UserRole = "owner" | "admin" | "manager" | "sales" | "viewer";

// These are the available permissions for each role
export const ROLE_PERMISSIONS = {
  owner: {
    canManageUsers: true,
    canManageRoles: true,
    canViewDashboard: true,
    canViewSales: true,
    canViewReports: true,
    canManageSettings: true,
  },
  admin: {
    canManageUsers: true,
    canManageRoles: false,
    canViewDashboard: true,
    canViewSales: true,
    canViewReports: true,
    canManageSettings: true,
  },
  manager: {
    canManageUsers: false,
    canManageRoles: false,
    canViewDashboard: true,
    canViewSales: true,
    canViewReports: true,
    canManageSettings: false,
  },
  sales: {
    canManageUsers: false,
    canManageRoles: false,
    canViewDashboard: true,
    canViewSales: true,
    canViewReports: false,
    canManageSettings: false,
  },
  viewer: {
    canManageUsers: false,
    canManageRoles: false,
    canViewDashboard: true,
    canViewSales: false,
    canViewReports: false,
    canManageSettings: false,
  },
} as const;