"use client"

import { useState } from "react"
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
import { cn } from "@/lib/utils"

export function ClientsTable({ initialClients }) {
  const [clients, setClients] = useState(initialClients)
  const [filteredClients, setFilteredClients] = useState(initialClients)
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Handle sort column click
  const handleSortClick = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Handle filter and search changes
  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value)
    applyFilters(value, statusFilter, searchQuery)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    applyFilters(categoryFilter, value, searchQuery)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    applyFilters(categoryFilter, statusFilter, query)
  }

  // Apply all filters
  const applyFilters = (category, status, query) => {
    let filtered = [...initialClients]
    
    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter(client => 
        client.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter(client => 
        client.status.toLowerCase() === status.toLowerCase()
      )
    }
    
    // Apply search query
    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(lowercaseQuery)
      )
    }
    
    setFilteredClients(filtered)
  }

  // Sort the clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  // Get sort icon
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />
    }
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" /> 
      : <ChevronDown className="h-4 w-4 ml-1" />
  }

  return (
    <div>
      <div className="flex items-center space-x-4 p-4 border-b">
        <Select defaultValue="all" onValueChange={handleCategoryFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Category: All</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="in-person">In-Person</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all" onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        
        <Input 
          placeholder="Search client" 
          className="max-w-xs ml-auto" 
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="w-full overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">
                <Checkbox />
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
            {sortedClients.length > 0 ? (
              sortedClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <Checkbox />
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
      </div>
    </div>
  )
}