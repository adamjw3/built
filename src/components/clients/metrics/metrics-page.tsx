"use client"
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { MetricsSummary } from "@/components/clients/metrics/metrics-summary"
import { MetricsOverviewChart } from '@/components/clients/metrics/metrics-overview-chart'
import { MetricsDetail } from '@/components/clients/metrics/metrics-detail'

export function MetricsPageClient({ metricsData, metricsHistoricalData, clientId }) {
  const [selectedMetric, setSelectedMetric] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize selectedMetric based on URL query parameter on component mount or when searchParams change
  useEffect(() => {
    const metricParam = searchParams.get('metric')
    
    if (metricParam) {
      // Find the metric with a matching name or ID
      const foundMetric = metricsHistoricalData.find(
        m => m.name.toLowerCase() === metricParam.toLowerCase() || m.id.toString() === metricParam
      )
      
      if (foundMetric) {
        setSelectedMetric(foundMetric)
      } else {
        // If metric not found, remove the query parameter
        const params = new URLSearchParams(searchParams)
        params.delete('metric')
        router.replace(`${pathname}?${params.toString()}`)
        setSelectedMetric(null)
      }
    } else {
      setSelectedMetric(null)
    }
  }, [searchParams, metricsHistoricalData, pathname, router])

  const handleSelectMetric = (metric) => {
    
    setSelectedMetric(metric)
    
    // Create new URLSearchParams object based on current params
    const params = new URLSearchParams(searchParams)
    // Add metric parameter with the metric name (lowercase)
    params.set('metric', metric.name.toLowerCase())
    // Update URL with the query parameter
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleBack = () => {
    setSelectedMetric(null)
    
    // Create new URLSearchParams object based on current params
    const params = new URLSearchParams(searchParams)
    // Remove the metric parameter
    params.delete('metric')
    
    // If there are other params, keep them
    const queryString = params.toString()
    const newPath = queryString ? `${pathname}?${queryString}` : pathname
    
    router.push(newPath, { scroll: false })
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="h-full p-6 border-r-2">
          <MetricsSummary 
            metrics={metricsData} 
            clientId={clientId} 
            historicalMetrics={metricsHistoricalData} 
            onSelectMetric={handleSelectMetric} 
          />
        </div>
      </ResizablePanel>
      <ResizablePanel defaultSize={70}>
        {selectedMetric ? (
          <div className="p-6 w-full h-full">
            <MetricsDetail 
              metric={selectedMetric} 
              clientId={clientId} 
              onBack={handleBack} 
            />
          </div>
        ) : (
          <div className="p-6 w-full grid grid-cols-2 gap-6">
            {metricsHistoricalData.map((metric) => (
              <div key={metric.id}>
                <MetricsOverviewChart 
                  metric={metric} 
                  onSelect={handleSelectMetric} 
                />
              </div>
            ))}
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}