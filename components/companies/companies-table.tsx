"use client";

import { useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Building2,
  Users,
  Target,
  Brain,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

type Company = {
  _id: Id<"companies">;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  type: string;
  owner: string;
  healthScore?: number;
  contactCount: number;
  activeDealCount: number;
  totalDealValue: number;
  createdAt: number;
  updatedAt: number;
};

interface CompaniesTableProps {
  companies: Company[];
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  onCompanySelect: (companyId: string) => void;
}

export function CompaniesTable({
  companies,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
  onCompanySelect,
}: CompaniesTableProps) {
  const deleteCompany = useMutation(api.companies.deleteCompany);

  const handleDeleteCompany = async (companyId: Id<"companies">) => {
    try {
      await deleteCompany({ id: companyId });
      toast.success("Company deleted successfully");
    } catch (error) {
      toast.error("Failed to delete company");
      console.error("Delete company error:", error);
    }
  };

  const columns: ColumnDef<Company>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Company Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-muted-foreground">
                  {company.industry || "No industry"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
          const website = row.getValue("website") as string;
          if (!website)
            return (
              <span className="text-muted-foreground text-sm">No website</span>
            );
          const url = website.startsWith("http://") || website.startsWith("https://")
            ? website
            : `https://${website}`;
          const displayUrl = website.replace(/^https?:\/\//, "");
          return (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {displayUrl}
              </a>
            </div>
          );
        },
      },
      {
        accessorKey: "contactCount",
        header: "Contacts",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue("contactCount") || 0}</span>
          </div>
        ),
      },
      {
        accessorKey: "activeDealCount",
        header: "Active Deals",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {row.getValue("activeDealCount") || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalDealValue",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Total Value
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue("totalDealValue") as number;
          return (
            <span className="font-medium">
              ${((value || 0) / 1000).toFixed(0)}K
            </span>
          );
        },
      },
      {
        accessorKey: "healthScore",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Health Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const score = (row.getValue("healthScore") as number) || 50;
          return (
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span
                className={`font-medium ${score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"}`}
              >
                {score}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return (
            <Badge
              variant="secondary"
              className={`${
                type === "customer"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : type === "prospect"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
              }`}
            >
              {type}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onCompanySelect(company._id)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>Edit company</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Create deal</DropdownMenuItem>
                <DropdownMenuItem>Add contact</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteCompany(company._id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onCompanySelect, deleteCompany],
  );

  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onCompanySelect(row.original._id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No companies found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{" "}
          of {table.getFilteredRowModel().rows.length} companies
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
