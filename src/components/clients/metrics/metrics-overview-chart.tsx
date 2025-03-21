"use client"
import { ArrowUp, ArrowDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Line, LineChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

type MetricDataPoint = {
  date: string
  value: number
}
type MetricEntry = {
  id: string
  name: string
  unit: string
  data: MetricDataPoint[]
  percentChange: string
}
type MetricsOverviewChartProps = {
  metric: MetricEntry
  onSelect: (metric: MetricEntry) => void
}
export function MetricsOverviewChart({ metric, onSelect }: MetricsOverviewChartProps ) {
  // Make sure we have data to display
  if (!metric || !metric.data || metric.data.length === 0) {
    return (
      <Card 
        className="border flex-1 border-blue-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onSelect(metric)}
      >
        <CardHeader className="pb-2">
          <CardTitle>{metric?.name || "No data"}</CardTitle>
          <div className="text-3xl font-semibold text-slate-700">
            N/A
          </div>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <p className="text-gray-500">No data points available for this metric</p>
        </CardContent>
      </Card>
    )
  }
  
  // Format the data for the chart with proper date formatting
  const chartData = metric.data.map(point => ({
    date: new Date(point.date),
    value: point.value
  }))
  
  // Determine if the percent change is positive, negative, or zero
  const percentChange = parseFloat(metric.percentChange)
  const isPositive = percentChange > 0
  
  // Get the latest value
  const latestValue = metric.data.length > 0 
    ? metric.data[metric.data.length - 1].value 
    : 0

  // Format the date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    }).toUpperCase();
  }

  // Format the x-axis ticks
  const formatXAxis = (tickItem) => {
    return formatDate(new Date(tickItem));
  }

  return (
    <Card 
      className="border flex-1 border-blue-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(metric)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-700">{metric.name}</CardTitle>
        <div>
          <span className="text-3xl font-semibold text-slate-700">
            {latestValue}{metric.unit && ` ${metric.unit}`}
          </span>{' '}
          <span className={`inline-flex items-center px-2 py-1 rounded-md ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1"/>
            ) : (
              <ArrowDown className="h-4 w-4 mr-1"/>
            )}
            {isPositive ? '+' : ''}{metric.percentChange}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 w-full">
          <div className='translate-x-[-20px] w-full h-full'>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dx={-10}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="none" 
                  fillOpacity={1}
                  fill="url(#colorValue)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366F1" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "#6366F1", strokeWidth: 2, stroke: "white" }} 
                  activeDot={{ r: 6, fill: "#6366F1", strokeWidth: 2, stroke: "white" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}