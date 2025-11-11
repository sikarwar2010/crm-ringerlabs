"use client";

import * as React from "react";
import {
  IconBuildingFactory,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
  IconSubtask,
  IconUser,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: IconUser,
    },
    {
      title: "Companies",
      url: "/companies",
      icon: IconBuildingFactory,
    },
    {
      title: "Deals",
      url: "/deals",
      icon: IconFolder,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: IconSubtask,
    },
    {
      title: "User Management",
      url: "/users",
      icon: IconUser,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconReport,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">RingerLabs CRM.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
