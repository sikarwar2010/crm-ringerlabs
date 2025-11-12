"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface DealsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  selectedOwner: string;
  onOwnerChange: (owner: string) => void;
}

export function DealsFilters({
  searchQuery,
  onSearchChange,
  selectedStage,
  onStageChange,
  selectedOwner,
  onOwnerChange,
}: DealsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    onSearchChange("");
    onStageChange("");
    onOwnerChange("");
    setShowFilters(false);
  };

  const hasActiveFilters = searchQuery || selectedStage || selectedOwner;

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search deals, companies, or contacts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-primary text-primary" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {
                  [searchQuery, selectedStage, selectedOwner].filter(Boolean)
                    .length
                }
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stage</label>
              <Select value={selectedStage} onValueChange={onStageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select value={selectedOwner} onValueChange={onOwnerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All owners</SelectItem>
                  <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
                  <SelectItem value="current-user">Current User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
