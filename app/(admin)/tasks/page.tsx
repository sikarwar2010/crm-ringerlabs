"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Brain } from "lucide-react";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskList } from "@/components/tasks/task-list";
import { AITaskSuggestions } from "@/components/tasks/ai-task-suggestions";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { ActivityTimeline } from "@/components/tasks/activity-timeline";
import type { Doc } from "@/convex/_generated/dataModel";

type TimelineActivity = {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task";
  title: string;
  description: string;
  contact: string;
  company: string;
  owner: string;
  timestamp: string;
  duration?: string;
  outcome?: string;
  sentiment?: "positive" | "neutral" | "negative";
};

const mockActivities: TimelineActivity[] = [
  {
    id: "1",
    type: "call",
    title: "Discovery Call",
    description:
      "Initial discovery call to understand requirements and pain points",
    contact: "John Smith",
    company: "ACME Corp",
    owner: "Sarah Johnson",
    timestamp: "2024-01-24T14:30:00Z",
    duration: "45 minutes",
    outcome: "Positive - interested in enterprise features",
    sentiment: "positive",
  },
  {
    id: "2",
    type: "email",
    title: "Proposal Sent",
    description:
      "Sent detailed proposal with pricing and implementation timeline",
    contact: "Emily Davis",
    company: "TechStart Inc",
    owner: "Mike Wilson",
    timestamp: "2024-01-24T10:15:00Z",
    sentiment: "neutral",
  },
  {
    id: "3",
    type: "meeting",
    title: "Product Demo",
    description: "Demonstrated key features and answered technical questions",
    contact: "Robert Chen",
    company: "Growth Co",
    owner: "Sarah Johnson",
    timestamp: "2024-01-23T16:00:00Z",
    duration: "60 minutes",
    outcome: "Very positive - ready to move forward",
    sentiment: "positive",
  },
  {
    id: "4",
    type: "note",
    title: "Follow-up Required",
    description: "Customer requested additional security documentation",
    contact: "Lisa Anderson",
    company: "Startup LLC",
    owner: "Mike Wilson",
    timestamp: "2024-01-23T11:20:00Z",
    sentiment: "neutral",
  },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<Doc<"tasks"> | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks & Activities</h1>
            <p className="text-muted-foreground mt-1">
              Manage your tasks and track all customer interactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Brain className="w-3 h-3 mr-1" />
              AI Suggestions Active
            </Badge>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <TaskStats />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 backdrop-blur-sm">
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-primary"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-primary"
            >
              Activity Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {/* Search and Filters */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <AITaskSuggestions />

            {/* Tasks Table */}
            <TaskList
              onTaskSelect={(task) => setSelectedTask(task)}
              globalFilter={globalFilter}
              statusFilter={statusFilter === "all" ? undefined : statusFilter}
              priorityFilter={
                priorityFilter === "all" ? undefined : priorityFilter
              }
            />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            {/* Activity Timeline */}
            <ActivityTimeline activities={mockActivities} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateTaskDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
        {selectedTask && (
          <TaskDetailSheet
            task={selectedTask}
            open={!!selectedTask}
            onOpenChange={(open) => !open && setSelectedTask(null)}
          />
        )}
      </div>
    </>
  );
}
