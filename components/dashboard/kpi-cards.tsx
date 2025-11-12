"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Target, Clock } from "lucide-react"
import type React from "react"

interface KPIData {
    pipelineValue: { value: number; change: number; trend: "up" | "down" }
    openDeals: { value: number; change: number; trend: "up" | "down" }
    closedWonMonth: { value: number; change: number; trend: "up" | "down" }
    overdueTasks: { value: number; change: number; trend: "up" | "down" }
}

interface KPICardsProps {
    data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
                title="Pipeline Value"
                value={`$${(data.pipelineValue.value / 1000000).toFixed(1)}M`}
                change={data.pipelineValue.change}
                trend={data.pipelineValue.trend}
                icon={<DollarSign className="w-5 h-5" />}
            />
            <KPICard
                title="Open Deals"
                value={data.openDeals.value.toString()}
                change={data.openDeals.change}
                trend={data.openDeals.trend}
                icon={<Target className="w-5 h-5" />}
            />
            <KPICard
                title="Closed Won (Month)"
                value={`$${(data.closedWonMonth.value / 1000).toFixed(0)}K`}
                change={data.closedWonMonth.change}
                trend={data.closedWonMonth.trend}
                icon={<TrendingUp className="w-5 h-5" />}
            />
            <KPICard
                title="Overdue Tasks"
                value={data.overdueTasks.value.toString()}
                change={data.overdueTasks.change}
                trend={data.overdueTasks.trend}
                icon={<Clock className="w-5 h-5" />}
            />
        </div>
    )
}

function KPICard({
    title,
    value,
    change,
    trend,
    icon,
}: {
    title: string
    value: string
    change: number
    trend: "up" | "down"
    icon: React.ReactNode
}) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                    {trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                        {Math.abs(change)}% from last month
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
