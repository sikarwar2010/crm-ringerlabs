"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskStats() {
  const tasksSummary = useQuery(api.tasks.getTasksSummary);

  if (!tasksSummary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-700/30 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Tasks",
      value: tasksSummary.totalTasks,
      icon: CheckSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: tasksSummary.completedTasks,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Due Today",
      value: tasksSummary.dueTodayTasks,
      icon: Circle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Overdue",
      value: tasksSummary.overdueTasks,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.title}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
