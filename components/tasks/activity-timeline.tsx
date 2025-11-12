"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Activity = {
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

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckSquare,
};

const sentimentIcons = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
};

const sentimentColors = {
  positive: "text-green-400",
  negative: "text-red-400",
  neutral: "text-gray-400",
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Activities</h2>
        <Badge variant="secondary" className="bg-card/50">
          {activities.length} activities
        </Badge>
      </div>

      <div className="space-y-4">
        {sortedActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const SentimentIcon = activity.sentiment
            ? sentimentIcons[activity.sentiment]
            : null;
          const isLast = index === sortedActivities.length - 1;

          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-700" />
              )}

              <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Activity Icon */}
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {activity.title}
                            </h3>
                            {activity.sentiment && SentimentIcon && (
                              <SentimentIcon
                                className={`w-4 h-4 ${sentimentColors[activity.sentiment]}`}
                              />
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            {activity.description}
                          </p>

                          {/* Activity Details */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                                  {activity.owner
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {activity.owner}
                            </span>
                            <span>•</span>
                            <span>{activity.contact}</span>
                            <span>•</span>
                            <span>{activity.company}</span>
                            {activity.duration && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.duration}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Outcome */}
                          {activity.outcome && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <strong>Outcome:</strong> {activity.outcome}
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="shrink-0 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No activities yet
            </h3>
            <p className="text-muted-foreground">
              Activities will appear here as you interact with contacts and
              deals.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
