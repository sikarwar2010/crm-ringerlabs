"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Contact = {
  _id: Id<"contacts">;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  owner: string;
  lastActivity?: number;
  sentiment?: "positive" | "neutral" | "negative";
  aiScore?: number;
  leadSource?: string;
  status: string;
  rating: string;
  createdAt: number;
  updatedAt: number;
};

interface ContactsTableProps {
  contacts: Contact[];
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  globalFilter: string;
  setGlobalFilter: Dispatch<SetStateAction<string>>;
  onContactSelect: (contact: Contact) => void;
}

export function ContactsTable({
  contacts,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
  onContactSelect,
}: ContactsTableProps) {
  const deleteContactMutation = useMutation(api.contacts.deleteContact);

  const handleDeleteContact = async (contactId: Id<"contacts">) => {
    try {
      await deleteContactMutation({ id: contactId });
      toast("The contact has been successfully deleted.");
    } catch (error) {
      toast("Failed to delete contact. Please try again.");
    }
  };

  const columns: ColumnDef<Contact>[] = useMemo(
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
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const contact = row.original;
          const fullName = `${contact.firstName} ${contact.lastName}`;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={`/placeholder-icon.png?height=32&width=32&text=${contact.firstName.charAt(0)}`}
                />
                <AvatarFallback>{contact.firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{fullName}</div>
                <div className="text-sm text-muted-foreground">
                  {contact.title}
                </div>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const nameA = `${rowA.original.firstName} ${rowA.original.lastName}`;
          const nameB = `${rowB.original.firstName} ${rowB.original.lastName}`;
          return nameA.localeCompare(nameB);
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue("email")}</span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue("phone") || "—"}</span>
          </div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue("company") || "—"}</span>
          </div>
        ),
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("owner")}</span>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("notes")}</span>
        ),
      },
      {
        accessorKey: "lastActivity",
        header: "Last Activity",
        cell: ({ row }) => {
          const lastActivity = row.getValue("lastActivity") as
            | number
            | undefined;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {lastActivity
                  ? new Date(lastActivity).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: ({ row }) => {
          const sentiment = row.getValue("sentiment") as string;
          return (
            <Badge
              variant="secondary"
              className={`${sentiment === "positive"
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : sentiment === "negative"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                }`}
            >
              {sentiment === "positive" && (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {sentiment === "negative" && (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {sentiment === "neutral" && <Minus className="w-3 h-3 mr-1" />}
              {sentiment || "neutral"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "aiScore",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              AI Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const score = row.getValue("aiScore") as number;
          return (
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span
                className={`font-medium ${score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"}`}
              >
                {score || 0}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onContactSelect(contact)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>Edit contact</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Create deal</DropdownMenuItem>
                <DropdownMenuItem>Send email</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteContact(contact._id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onContactSelect, handleDeleteContact],
  );

  const table = useReactTable({
    data: contacts,
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
                onClick={() => onContactSelect(row.original)}
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
                No contacts found.
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
          of {table.getFilteredRowModel().rows.length} contacts
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
