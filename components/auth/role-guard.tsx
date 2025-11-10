"use client";

import React from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { ROLE_PERMISSIONS, type UserRole } from "../../convex/users";
import type { ReactNode } from "react";

interface RoleGuardProps {
	children: ReactNode;
	permission?: keyof (typeof ROLE_PERMISSIONS)[UserRole];
	roles?: UserRole[];
	fallback?: ReactNode;
}

export function RoleGuard({ children, permission, roles, fallback }: RoleGuardProps) {
	const { user } = useUser();
	const currentUser = useQuery(api.users.getCurrentUser, user ? { clerkId: user.id } : "skip");

	if (!user || !currentUser) {
		return fallback || null;
	}

	// Check role-based access
	if (roles && !roles.includes(currentUser.role as UserRole)) {
		return fallback || null;
	}

	// Check permission-based access
	if (permission) {
		const permissions = ROLE_PERMISSIONS[currentUser.role as UserRole];
		if (!permissions[permission]) {
			return fallback || null;
		}
	}

	return <div>{children}</div>;
}
