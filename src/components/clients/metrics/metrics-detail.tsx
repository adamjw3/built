"use client"


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

type MetricDetailprops = {
  metric: MetricEntry
  clientId: string
  onBack?: () => void
}

export function MetricsDetail() {
  return(
    <div>Hi</div>
  )
}