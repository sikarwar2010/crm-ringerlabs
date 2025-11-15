"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  CheckSquare,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Task = Doc<"tasks"> & {
  relatedEntity?: unknown;
  isOverdue?: boolean;
};

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  globalFilter?: string;
  statusFilter?: string;
  priorityFilter?: string;
}

export function TaskList({
  onTaskSelect,
  globalFilter: externalGlobalFilter,
  statusFilter,
  priorityFilter,
}: TaskListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const queryArgs = useMemo(
    () => ({
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      priority:
        priorityFilter && priorityFilter !== "all" ? priorityFilter : undefined,
      search:
        externalGlobalFilter && externalGlobalFilter.trim().length > 0
          ? externalGlobalFilter
          : undefined,
    }),
    [externalGlobalFilter, priorityFilter, statusFilter],
  );

  const tasksQuery = useQuery(api.tasks.getTasks, queryArgs);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const tasks = tasksQuery?.tasks || [];

  useEffect(() => {
    if (typeof externalGlobalFilter === "string") {
      setGlobalFilter(externalGlobalFilter);
    }
  }, [externalGlobalFilter]);

  const handleStatusUpdate = useCallback(
    async (taskId: string, newStatus: string) => {
      try {
        await updateTaskStatus({
          id: taskId as Id<"tasks">,
          status: newStatus,
        });
        toast("Task status updated successfully.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update task status.";
        toast.error(message);
      }
    },
    [toast, updateTaskStatus],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask({ id: taskId as Id<"tasks"> });
        toast("Task deleted successfully.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete task.";
        toast.error(message);
      }
    },
    [deleteTask, toast],
  );

  const taskColumns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            onClick={(event) => event.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(event) => event.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "subject",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Task
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{task.subject}</div>
                {task.description && (
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string;
          return (
            <Badge
              variant="secondary"
              className={`${
                priority === "high"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : priority === "medium"
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
              }`}
            >
              {priority}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              variant="secondary"
              className={`${
                status === "completed"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : status === "in-progress"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : status === "not-started"
                      ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              {status === "not-started"
                ? "Not Started"
                : status === "in-progress"
                  ? "In Progress"
                  : status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {row.getValue<string>("assignedTo").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{row.getValue("assignedTo")}</span>
          </div>
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Due Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const dueDate = new Date(row.getValue("dueDate"));
          const isOverdue =
            dueDate < new Date() && row.original.status !== "completed";
          return (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm ${isOverdue ? "text-red-500" : ""}`}>
                {dueDate.toLocaleDateString()}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const task = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onTaskSelect(task);
                  }}
                >
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    handleStatusUpdate(task._id, "completed");
                  }}
                >
                  Mark complete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteTask(task._id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDeleteTask, handleStatusUpdate, onTaskSelect],
  );

  const table = useReactTable({
    data: tasks,
    columns: taskColumns,
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

  if (!tasksQuery) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
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
                    onClick={() => onTaskSelect(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={taskColumns.length}
                    className="h-24 text-center"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
          of {table.getFilteredRowModel().rows.length} tasks
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
