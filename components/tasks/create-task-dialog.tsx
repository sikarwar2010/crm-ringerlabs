"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  AlertCircle,
  CheckSquare,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedTo?: string;
  relatedId?: string;
  defaultAssignee?: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  relatedTo,
  relatedId,
  defaultAssignee,
}: CreateTaskDialogProps) {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
    status: "not-started",
    assignedTo: defaultAssignee || "",
    dueDate: new Date(),
  });

  const createTask = useMutation(api.tasks.createTask);
  const teamMembers = useQuery(api.users.getUsers, { limit: 50 });
  const teamMemberOptions = (teamMembers ?? []) as Doc<"users">[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.subject.trim()) return;

    setIsCreating(true);
    try {
      await createTask({
        subject: formData.subject.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate.getTime(),
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo || user.id,
        relatedTo: relatedTo || undefined,
        relatedId: relatedId || undefined,
      });

      toast("Task created successfully.");

      // Reset form
      setFormData({
        subject: "",
        description: "",
        priority: "medium",
        status: "not-started",
        assignedTo: defaultAssignee || "",
        dueDate: new Date(),
      });
      onOpenChange(false);
    } catch (error) {
      toast("Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Low", icon: Clock, color: "text-gray-500" },
    {
      value: "medium",
      label: "Medium",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    { value: "high", label: "High", icon: AlertCircle, color: "text-red-500" },
  ];

  const statusOptions = [
    { value: "not-started", label: "Not Started", color: "text-gray-500" },
    { value: "in-progress", label: "In Progress", color: "text-blue-500" },
    { value: "completed", label: "Completed", color: "text-green-500" },
    { value: "deferred", label: "Deferred", color: "text-orange-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new task and assign it to a team member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-white">
              Task Subject *
            </Label>
            <Input
              id="subject"
              placeholder="Enter task subject..."
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add task description..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Priority</Label>
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
                  {priorityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Status</Label>
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
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <CheckSquare className={`h-4 w-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Assign To</Label>
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
                  {teamMemberOptions
                    .filter((member) => Boolean(member?.clerkId))
                    .map((member) => (
                      <SelectItem key={member._id} value={member.clerkId}>
                        {[member.firstName, member.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unnamed team member"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                      !formData.dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate
                      ? format(formData.dueDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({ ...prev, dueDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Related Information */}
          {relatedTo && relatedId && (
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckSquare className="h-4 w-4" />
                <span>
                  This task will be linked to the selected {relatedTo}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.subject.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
