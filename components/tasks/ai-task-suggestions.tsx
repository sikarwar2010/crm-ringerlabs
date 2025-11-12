"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function AITaskSuggestions() {
  const { user } = useUser();
  const createTask = useMutation(api.tasks.createTask);

  // Mock suggestions - in real app, this would come from AI analysis
  const suggestions = [
    {
      subject: "Follow up with ACME Corp",
      description: "No activity in 5 days, deal worth $250K",
      priority: "high",
      dueInMs: 2 * DAY_IN_MS,
      relatedTo: "deal",
      relatedId: "deal-1",
    },
    {
      subject: "Schedule demo for TechStart Inc",
      description: "High engagement, ready for next step",
      priority: "medium",
      dueInMs: 3 * DAY_IN_MS,
      relatedTo: "company",
      relatedId: "company-2",
    },
  ] as const;

  const handleCreateTask = async (suggestion: (typeof suggestions)[number]) => {
    if (!user) {
      toast("You need to be signed in to create tasks.");
      return;
    }

    try {
      await createTask({
        subject: suggestion.subject,
        description: suggestion.description,
        // eslint-disable-next-line react-hooks/purity
        dueDate: Date.now() + suggestion.dueInMs,
        priority: suggestion.priority,
        assignedTo: user.id,
        aiSuggested: true,
      });

      toast("AI suggested task has been created successfully.");
    } catch (error) {
      toast("Failed to create task.");
    }
  };

  return (
    <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Task Suggestions
        </CardTitle>
        <CardDescription>
          Smart recommendations based on your pipeline activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/50"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{suggestion.subject}</div>
              <div className="text-xs text-muted-foreground">
                {suggestion.description}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateTask(suggestion)}
            >
              Create Task
            </Button>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent">
          View All Suggestions
        </Button>
      </CardContent>
    </Card>
  );
}
