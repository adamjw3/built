"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  MessageSquare
} from "lucide-react"
import { ClientActions } from "@/components/clients/client-actions"
import { useClients } from "@/lib/hooks/use-clients"
import { cn } from "@/lib/utils"

export function ClientsTable() {
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClients, setSelectedClients] = useState([])
  const checkboxRef = useRef(null)
  
  // Create filters object for React Query
  const filters = {
    sortBy: sortColumn,
    order: sortDirection,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  }
  
  // Fetch clients using React Query
  const { data, isLoading, isError } = useClients(filters)
  const clients = data?.clients || []
  
  // Reset selected clients when data changes
  useEffect(() => {
    setSelectedClients([])
  }, [data])
  
  // Set indeterminate state on checkbox via DOM API
  useEffect(() => {
    if (checkboxRef.current) {
      const isIndeterminate = selectedClients.length > 0 && selectedClients.length < clients.length
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [selectedClients, clients])
  
  // Handle sort column click
  const handleSortClick = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />
    }
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" /> 
      : <ChevronDown className="h-4 w-4 ml-1" />
  }

  const checkHandler = (checked, clientId) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId])
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId))
    }
  }

  const onCheckedAllChange = (checked: boolean) => {
    if(checked) {
      const allClientIds = clients.map(client => client.id)
      setSelectedClients(allClientIds)
    } else {
      setSelectedClients([])
    }
  }

  return (
    <div>
      <div className="flex items-center space-x-4 p-4 border-b">
        <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Category: All</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="inPerson">In-Person</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="Connected">Connected</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Offline">Offline</SelectItem>
            <SelectItem value="Archive">Archive</SelectItem>
          </SelectContent>
        </Select>
        
        <Input 
          placeholder="Search client" 
          className="max-w-xs ml-auto" 
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {selectedClients.length > 0 && (
            <ClientActions selectedClients={selectedClients} setSelectedClients={setSelectedClients}/>
        )}
      </div>

      <div className="w-full overflow-auto">
        {isLoading ? (
          <div className="p-8 text-center">Loading clients...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading clients</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">
                  <Checkbox 
                    ref={checkboxRef}
                    onCheckedChange={onCheckedAllChange}
                    checked={selectedClients.length > 0 && selectedClients.length === clients.length}
                  />
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("name")}
                >
                  <div className="flex items-center">
                    Name {getSortIcon("name")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("lastActivity")}
                >
                  <div className="flex items-center">
                    Last Activity {getSortIcon("lastActivity")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("lastTraining7d")}
                >
                  <div className="flex items-center">
                    Last 7d Training {getSortIcon("lastTraining7d")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("lastTraining30d")}
                >
                  <div className="flex items-center">
                    Last 30d Training {getSortIcon("lastTraining30d")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("lastTasks7d")}
                >
                  <div className="flex items-center">
                    Last 7d Tasks {getSortIcon("lastTasks7d")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("category")}
                >
                  <div className="flex items-center">
                    Category {getSortIcon("category")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("status")}
                >
                  <div className="flex items-center">
                    Status {getSortIcon("status")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedClients.includes(client.id)} 
                        onCheckedChange={(checked) => checkHandler(checked, client.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 bg-amber-100 text-amber-800">
                          <AvatarFallback>
                            {client.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Link 
                          href={`/clients/${client.id}`} 
                          className="hover:underline text-blue-600"
                        >
                          {client.name}{client.demo ? " - Demo" : ""}
                        </Link>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-gray-200">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                        </div>
                        <span>{client.lastActivity}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {client.lastTraining7d !== undefined ? `${client.lastTraining7d}%` : "--"}
                    </td>
                    <td className="p-3">
                      {client.lastTraining30d !== undefined ? `${client.lastTraining30d}%` : "--"}
                    </td>
                    <td className="p-3">
                      {client.lastTasks7d !== undefined ? `${client.lastTasks7d}%` : "--"}
                    </td>
                    <td className="p-3">
                      {client.category}
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-sm",
                        client.status === "Connected" ? "bg-green-100 text-green-800" : 
                        client.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-gray-100 text-gray-800"
                      )}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}