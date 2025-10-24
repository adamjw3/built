"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useUpdateMetricPreferences } from "@/hooks/use-metrics"

type MetricEntry = {
  id: string
  name: string
  value: string | null
  lastUpdate: string | null
  unit?: string
  isVisible?: boolean
  displayOrder?: number
}

type MetricsSummaryProps = {
  metrics: MetricEntry[]
  clientId: string
  historicalMetrics: Array<any>
  onSelectMetric: (metric: any) => void
}

export function MetricsSummary({ metrics, clientId, historicalMetrics, onSelectMetric }: MetricsSummaryProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [orderedMetrics, setOrderedMetrics] = useState<MetricEntry[]>([])
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const mouseDownTime = useRef<number>(0)
  
  // Use React Query mutation hook for updating preferences
  const updatePreferences = useUpdateMetricPreferences(clientId)
  
  // Initialize ordered metrics from props
  useEffect(() => {
    // Add displayOrder if not present
    const metricsWithOrder = metrics.map((metric, index) => ({
      ...metric,
      displayOrder: metric.displayOrder ?? index,
    }))
    setOrderedMetrics(metricsWithOrder)
  }, [metrics])
  
  const handleDragStart = (index: number) => {
    mouseDownTime.current = Date.now()
    dragItem.current = index
    setIsDragging(true)
  }
  
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }
  
  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setIsDragging(false)
      return
    }
    
    // Make a copy of the ordered metrics
    const updatedMetrics = [...orderedMetrics]
    
    // Remove the dragged item
    const draggedItem = updatedMetrics[dragItem.current]
    updatedMetrics.splice(dragItem.current, 1)
    
    // Insert at the new position
    updatedMetrics.splice(dragOverItem.current, 0, draggedItem)
    
    // Update display order values
    const reorderedMetrics = updatedMetrics.map((metric, index) => ({
      ...metric,
      displayOrder: index
    }))
    
    // Update state
    setOrderedMetrics(reorderedMetrics)
    dragItem.current = null
    dragOverItem.current = null
    setIsDragging(false)
    
    // Automatically save the new order
    savePreferences(reorderedMetrics)
  }
  
  const savePreferences = (metricsToSave = orderedMetrics) => {
    if (!clientId || updatePreferences.isPending) return
    
    // Use React Query mutation to update preferences
    updatePreferences.mutate(metricsToSave)
  }

  const handleRowClick = (metric) => {
    onSelectMetric(metric)
  }
  
  const metricsCount = orderedMetrics.length
  
  return (
    <Card className="border-blue-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-600 font-medium flex items-center text-lg">
                {isOpen ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronUp className="h-5 w-5 mr-2" />}
                <Link 
                          href={`/clients/${clientId}/metrics`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >All Metrics ({metricsCount})</Link>
              </CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-0">
            {updatePreferences.isPending ? (
              <div className="p-4 text-center">Saving changes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 text-gray-500"></TableHead>
                    <TableHead className="text-gray-500">NAME</TableHead>
                    <TableHead className="text-gray-500">VALUE</TableHead>
                    <TableHead className="text-gray-500">LAST UPDATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderedMetrics.map((metric, index) => (
                    <TableRow 
                      key={metric.id}
                      className={cn(
                        !metric.value && "bg-blue-50",
                        isDragging && dragItem.current === index && "opacity-30",
                        "cursor-move hover:bg-blue-50"
                      )}
                      draggable={true}
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => handleRowClick(metric)}
                    >
                      <TableCell className="w-10">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </TableCell>
                      <TableCell className="font-medium py-6">
                        <Link 
                          href={`/clients/${clientId}/metrics?metric=${encodeURIComponent(metric.name.toLowerCase())}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {metric.name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-6">
                        {metric.value ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}` : "—"}
                      </TableCell>
                      <TableCell className="text-gray-500 py-6">
                        {metric.lastUpdate || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}