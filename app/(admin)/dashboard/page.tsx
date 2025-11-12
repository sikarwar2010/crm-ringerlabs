"use client"

import { Badge } from "@/components/ui/badge"
import { Brain } from "lucide-react"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ChartsSection } from "@/components/dashboard/charts-section"
import { AIInsightsPanel } from "@/components/dashboard/ai-insights-panel"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

const kpiData = {
  pipelineValue: { value: 2450000, change: 12.5, trend: "up" as const },
  openDeals: { value: 47, change: -3.2, trend: "down" as const },
  closedWonMonth: { value: 890000, change: 18.7, trend: "up" as const },
  overdueTasks: { value: 12, change: -25.0, trend: "up" as const },
}

const funnelData = [
  { name: "Leads", value: 1200, fill: "hsl(var(--chart-1))" },
  { name: "Qualified", value: 800, fill: "hsl(var(--chart-2))" },
  { name: "Proposal", value: 400, fill: "hsl(var(--chart-3))" },
  { name: "Negotiation", value: 200, fill: "hsl(var(--chart-4))" },
  { name: "Closed Won", value: 120, fill: "hsl(var(--chart-5))" },
]

const revenueData = [
  { month: "Jan", actual: 65000, predicted: 62000 },
  { month: "Feb", actual: 78000, predicted: 75000 },
  { month: "Mar", actual: 92000, predicted: 88000 },
  { month: "Apr", actual: 85000, predicted: 90000 },
  { month: "May", actual: 98000, predicted: 95000 },
  { month: "Jun", actual: 0, predicted: 105000 },
]

const aiInsights = [
  {
    type: "risk",
    title: "3 deals at high risk",
    description: "ACME Corp deal showing negative sentiment in recent calls",
    priority: "high" as const,
  },
  {
    type: "opportunity",
    title: "Follow-up opportunities",
    description: "5 warm leads haven't been contacted in 7+ days",
    priority: "medium" as const,
  },
  {
    type: "sentiment",
    title: "Sentiment alert",
    description: "TechStart Inc. showing declining engagement patterns",
    priority: "medium" as const,
  },
]

const recentActivities = [
  {
    id: 1,
    type: "call" as const,
    contact: "John Smith",
    company: "ACME Corp",
    summary: "Discussed pricing options, positive response to enterprise package",
    time: "2 hours ago",
    sentiment: "positive" as const,
  },
  {
    id: 2,
    type: "email" as const,
    contact: "Sarah Johnson",
    company: "TechStart Inc",
    summary: "Follow-up on proposal, requested technical specifications",
    time: "4 hours ago",
    sentiment: "neutral" as const,
  },
  {
    id: 3,
    type: "meeting" as const,
    contact: "Mike Davis",
    company: "Growth Co",
    summary: "Demo completed, decision maker impressed with AI features",
    time: "1 day ago",
    sentiment: "positive" as const,
  },
]

export default function DashboardPage() {
  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here whats happening with your sales.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Brain className="w-3 h-3 mr-1" />
              AI Insights Active
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards data={kpiData} />

        {/* Charts Section */}
        <ChartsSection funnelData={funnelData} revenueData={revenueData} />

        {/* AI Insights and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsightsPanel insights={aiInsights} />
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </>
  )
}
