"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Calendar } from "lucide-react"

interface RecentActivity {
    id: number
    type: "call" | "email" | "meeting"
    contact: string
    company: string
    summary: string
    time: string
    sentiment: "positive" | "neutral" | "negative"
}

interface ActivityFeedProps {
    activities: RecentActivity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                </CardTitle>
                <CardDescription>Latest interactions with AI summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border border-border/50 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {activity.type === "call" && <Users className="w-4 h-4 text-primary" />}
                            {activity.type === "email" && <Activity className="w-4 h-4 text-primary" />}
                            {activity.type === "meeting" && <Calendar className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{activity.contact}</span>
                                <span className="text-xs text-muted-foreground">at {activity.company}</span>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${activity.sentiment === "positive"
                                        ? "bg-green-500/10 text-green-500"
                                        : activity.sentiment === "negative"
                                            ? "bg-red-500/10 text-red-500"
                                            : "bg-yellow-500/10 text-yellow-500"
                                        }`}
                                >
                                    {activity.sentiment}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{activity.summary}</p>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                    </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                    View All Activities
                </Button>
            </CardContent>
        </Card>
    )
}
