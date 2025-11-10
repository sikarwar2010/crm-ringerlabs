"use client";
import React from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";

export function UserProfile() {
	const { user } = useUser();
	const { signOut } = useClerk();
	const currentUser = useQuery(api.users.getCurrentUser, user ? { clerkId: user.id } : "skip");

	if (!user || !currentUser) {
		return null;
	}

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "owner":
				return "bg-purple-500/10 text-purple-500 border-purple-500/20";
			case "admin":
				return "bg-red-500/10 text-red-500 border-red-500/20";
			case "manager":
				return "bg-blue-500/10 text-blue-500 border-blue-500/20";
			case "sales":
				return "bg-green-500/10 text-green-500 border-green-500/20";
			default:
				return "bg-gray-500/10 text-gray-500 border-gray-500/20";
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarImage src={currentUser.imageUrl || user.imageUrl} alt={user.fullName || ""} />
						<AvatarFallback>
							{currentUser.firstName.charAt(0)}
							{currentUser.lastName.charAt(0)}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-2">
						<p className="text-sm font-medium leading-none">
							{currentUser.firstName} {currentUser.lastName}
						</p>
						<p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
						<Badge variant="secondary" className={`w-fit text-xs ${getRoleBadgeColor(currentUser.role)}`}>
							{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
						</Badge>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<User className="mr-2 h-4 w-4" />
					<span>Profile</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Settings className="mr-2 h-4 w-4" />
					<span>Settings</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<HelpCircle className="mr-2 h-4 w-4" />
					<span>Support</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => signOut()}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
