"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Save,
  X,
  CheckSquare,
  User,
  CalendarDays,
  Flag,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type TaskDoc = Doc<"tasks">;
type UserDoc = Doc<"users">;

interface TaskDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDoc | null;
}

interface TaskFormState {
  subject: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  dueDate: Date;
}

const PRIORITY_BADGES: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const STATUS_BADGES: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "not-started": "bg-gray-500/10 text-gray-500 border-gray-500/20",
  deferred: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const DEFAULT_FORM_STATE: TaskFormState = {
  subject: "",
  description: "",
  priority: "medium",
  status: "not-started",
  assignedTo: "",
  dueDate: new Date(),
};

export function TaskDetailSheet({
  open,
  onOpenChange,
  task,
}: TaskDetailSheetProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<TaskFormState>(DEFAULT_FORM_STATE);

  const updateTask = useMutation(api.tasks.updateTask);
  const teamMembers = useQuery(api.users.getUsers, { limit: 50 }) as
    | UserDoc[]
    | undefined;

  useEffect(() => {
    if (task) {
      setFormData({
        subject: task.subject ?? "",
        description: task.description ?? "",
        priority: task.priority ?? "medium",
        status: task.status ?? "not-started",
        assignedTo: task.assignedTo ?? "",
        dueDate: new Date(task.dueDate),
      });
    } else {
      setFormData(DEFAULT_FORM_STATE);
    }
  }, [task]);

  const teamMemberOptions = useMemo(
    () => (teamMembers ?? []).filter((member) => Boolean(member?.clerkId)),
    [teamMembers],
  );

  const assignedUser = useMemo(
    () =>
      teamMemberOptions.find(
        (member) => member?.clerkId === task?.assignedTo,
      ),
    [task?.assignedTo, teamMemberOptions],
  );

  const isOverdue =
    !!task &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  if (!task) return null;

  const handleSave = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateTask({
        id: task._id as Id<"tasks">,
        subject: formData.subject.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate.getTime(),
      });

      toast("Task updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast("Failed to update task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (!task) return;

    setFormData({
      subject: task.subject ?? "",
      description: task.description ?? "",
      priority: task.priority ?? "medium",
      status: task.status ?? "not-started",
      assignedTo: task.assignedTo ?? "",
      dueDate: new Date(task.dueDate),
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) =>
    PRIORITY_BADGES[priority] ?? PRIORITY_BADGES.low;

  const getStatusColor = (status: string) =>
    STATUS_BADGES[status] ?? STATUS_BADGES["not-started"];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task Details
            </SheetTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isUpdating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <SheetDescription className="text-gray-400">
            View and edit task details, track progress, and manage assignments.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Subject</Label>
            {isEditing ? (
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="bg-gray-700 border-gray-600 text-white"
              />
            ) : (
              <p className="text-white font-medium">{task.subject}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
                placeholder="Add task description..."
              />
            ) : (
              <p className="text-sm text-gray-300">
                {task.description || "No description provided"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-white">
                <CheckSquare className="h-4 w-4" />
                Status
              </Label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="deferred">Deferred</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status === "not-started"
                    ? "Not Started"
                    : task.status === "in-progress"
                      ? "In Progress"
                      : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-white">
                <Flag className="h-4 w-4" />
                Priority
              </Label>
              {isEditing ? (
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-white">
                <User className="h-4 w-4" />
                Assigned To
              </Label>
              {isEditing ? (
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, assignedTo: value }))
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMemberOptions.map((member) => (
                      <SelectItem key={member._id} value={member.clerkId}>
                        {[member.firstName, member.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unnamed team member"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={assignedUser?.imageUrl ?? "/placeholder.svg"}
                    />
                    <AvatarFallback className="text-xs">
                      {`${assignedUser?.firstName?.charAt(0) ?? ""}${
                        assignedUser?.lastName?.charAt(0) ?? ""
                      }`}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">
                    {assignedUser
                      ? `${assignedUser.firstName ?? ""} ${
                          assignedUser.lastName ?? ""
                        }`.trim()
                      : "Unknown User"}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-white">
                <CalendarDays className="h-4 w-4" />
                Due Date
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.dueDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value
                        ? new Date(e.target.value)
                        : prev.dueDate,
                    }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              ) : (
                <span className={`text-sm ${isOverdue ? "text-red-400" : "text-white"}`}>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
                </span>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}



