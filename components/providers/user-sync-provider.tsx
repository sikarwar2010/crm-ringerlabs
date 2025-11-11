"use client";

import type React from "react";

import { useUserSync } from "@/hooks/use-user-sync";
import { Loader2 } from "lucide-react";

interface UserSyncProviderProps {
  children: React.ReactNode;
}

export function UserSyncProvider({ children }: UserSyncProviderProps) {
  const { user, isLoading } = useUserSync();

  // Show loading state while syncing user
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
