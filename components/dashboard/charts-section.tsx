"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    FunnelChart,
    Funnel,
} from "recharts"
import { Target } from "lucide-react"

interface FunnelData {
    name: string
    value: number
    fill: string
}

interface RevenueData {
    month: string
    actual: number
    predicted: number
}

interface ChartsSectionProps {
    funnelData: FunnelData[]
    revenueData: RevenueData[]
}

export function ChartsSection({ funnelData, revenueData }: ChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Funnel */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Sales Funnel
                    </CardTitle>
                    <CardDescription>Deals by pipeline stage</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart>
                            <Tooltip />
                            <Funnel dataKey="value" data={funnelData} cx="50%" cy="50%" />
                        </FunnelChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue Forecast */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="w-5 h-5" />
                        Revenue Forecast
                    </CardTitle>
                    <CardDescription>AI-predicted vs actual revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="AI Predicted"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
