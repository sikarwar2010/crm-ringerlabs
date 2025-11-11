"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ContactsFiltersProps {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  sentimentFilter: string;
  setSentimentFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export function ContactsFilters({
  globalFilter,
  setGlobalFilter,
  sentimentFilter,
  setSentimentFilter,
  statusFilter,
  setStatusFilter,
}: ContactsFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        value={sentimentFilter}
        onValueChange={(value) =>
          setSentimentFilter(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiment</SelectItem>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="working">Working</SelectItem>
          <SelectItem value="unqualified">Unqualified</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
