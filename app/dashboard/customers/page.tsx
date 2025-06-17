"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Search, X } from "lucide-react"

interface CustomerData {
  id: number
  name: string
  full_name: string
  email: string
  phone_number: string
  status: string
}

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    data: {
      data: CustomerData[]
    }
    meta: {
      current_page: number
      from: number
      last_page: number
      links: PaginationLink[]
      path: string
      per_page: number
      to: number
      total: number
    }
    links: {
      first: string
      last: string
      prev: string | null
      next: string | null
    }
  }
  status: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("all") // all, name, email, phone_number

  const fetchCustomers = async (page = 1, search = "") => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // Build URL with search parameters
      let url = `http://127.0.0.1:8000/api/admins/customer?page=${page}`

      if (search.trim()) {
        // Add search parameter based on search type
        if (searchType === "all") {
          url += `&search=${encodeURIComponent(search.trim())}`
        } else {
          url += `&${searchType}=${encodeURIComponent(search.trim())}`
        }
      }

      console.log("Fetching customers from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      const responseData: ApiResponse = await response.json()
      console.log("Response data:", responseData)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (responseData.success) {
        if (responseData.data && responseData.data.data && responseData.data.data.data) {
          setCustomers(responseData.data.data.data)
          setCurrentPage(responseData.data.meta.current_page)
          setTotalPages(responseData.data.meta.last_page)
          setTotalItems(responseData.data.meta.total)
        } else {
          console.error("Unexpected data structure:", responseData)
          setError("Unexpected data structure received from server")
        }
      } else {
        setError(responseData.message || "Failed to fetch customers")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError(error instanceof Error ? error.message : "An error occurred while fetching customers")
    } finally {
      setLoading(false)
    }
  }

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when searching
      fetchCustomers(1, query)
    }, 500) // 500ms delay

    setSearchTimeout(timeout)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setCurrentPage(1)
    fetchCustomers(1, "")
  }

  useEffect(() => {
    fetchCustomers(1)

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchCustomers(page, searchQuery)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "active") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    } else if (statusLower === "inactive") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
    } else {
      return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleRetry = () => {
    fetchCustomers(currentPage, searchQuery)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Customers</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={handleRetry} className="inline-flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
            <p className="text-slate-600">Manage and view customer information</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700">Search by:</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Fields</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone_number">Phone Number</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search by ${searchType === "all" ? "name, email, or phone" : searchType}...`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64 pl-10 pr-10 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Card - Smaller and positioned on the left */}
      <div className="flex justify-start">
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Customers</p>
                <p className="text-xl font-bold text-slate-900">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customers List</CardTitle>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No customers found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.id}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.full_name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone_number}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                    customers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
