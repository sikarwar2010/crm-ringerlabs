"use client";

import { useState } from "react";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { CompaniesTable } from "@/components/companies/companies-table";
import { AddCompanyDialog } from "@/components/companies/add-company-dialog";
import { CompanyDetailSheet } from "@/components/companies/company-detail-sheet";
import { Search, Download, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  const companiesData = useQuery(api.companies.getCompanies, {
    search: globalFilter || undefined,
    type:
      (columnFilters.find((f) => f.id === "status")?.value as string) ||
      undefined,
    limit: 50,
    offset: 0,
  });

  const companies = companiesData?.companies || [];
  const isLoading = companiesData === undefined;

  return (
   <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Companies</h1>
            <p className="text-muted-foreground">
              Manage your accounts with AI-powered health scores
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <AddCompanyDialog />
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={
                  (columnFilters.find((f) => f.id === "status")
                    ?.value as string) ?? ""
                }
                onValueChange={(value) => {
                  const newFilters = columnFilters.filter(
                    (f) => f.id !== "status",
                  );
                  if (value !== "all") {
                    newFilters.push({ id: "status", value });
                  }
                  setColumnFilters(newFilters);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <CompaniesTable
                companies={companies}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onCompanySelect={(companyId) => setSelectedCompanyId(companyId)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Detail Sheet */}
      {selectedCompanyId && (
        <CompanyDetailSheet
          companyId={selectedCompanyId}
          open={!!selectedCompanyId}
          onOpenChange={(open) => !open && setSelectedCompanyId(null)}
        />
      )}
    </>
  );
}
