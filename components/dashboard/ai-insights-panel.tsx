"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

interface AIInsight {
    type: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
}

interface AIInsightsPanelProps {
    insights: AIInsight[]
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
    return (
        <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Insights
                </CardTitle>
                <CardDescription>Smart recommendations for your sales team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
                        <div
                            className={`w-2 h-2 rounded-full mt-2 ${insight.priority === "high"
                                ? "bg-destructive"
                                : insight.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                        />
                        <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs">
                            View
                        </Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                    View All Insights
                </Button>
            </CardContent>
        </Card>
    )
}
