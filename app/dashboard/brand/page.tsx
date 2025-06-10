"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Award,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  X,
  ImageIcon,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface BrandData {
  id: number
  name: string
  note: string | null
  image: string | null
  description: string
  created_at: string
  updated_at: string
}

interface BrandDetailData {
  general: {
    id: number
    name: string
    note: string | null
    image: string | null
    description: string
    created_at: string
    updated_at: string
  }
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
      data: BrandData[]
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

interface ToastNotification {
  id: string
  type: "success" | "error"
  title: string
  message: string
}

export default function BrandPage() {
  const [brands, setBrands] = useState<BrandData[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [apiError, setApiError] = useState("")
  const router = useRouter()

  // Toast notification functions
  const addToast = (type: "success" | "error", title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastNotification = { id, type, title, message }
    setToasts((prev) => [...prev, newToast])

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Fetch brands data from API
  const fetchBrands = async (page = 1, value = "") => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setApiError("No authentication token found. Please login.")
        setIsLoading(false)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setApiError("")

      const params = new URLSearchParams()
      if (page > 1) params.append("page", page.toString())
      if (value.trim()) {
        params.append("name", value.trim())
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/admins/brand${params.toString() ? `?${params.toString()}` : ""}`

      console.log("Fetching brands from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      // Only redirect to login if we get a 401 Unauthorized
      if (response.status === 401) {
        console.log("Unauthorized access, redirecting to login")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      let responseData: any
      try {
        responseData = await response.json()
        console.log("API Response:", responseData)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        setApiError(`Failed to parse server response. Status: ${response.status}`)
        setBrands([])
        return
      }

      if (response.ok) {
        // Check if response has success field and it's false
        if (responseData.success === false) {
          setApiError(responseData.message || "API returned success: false")
          addToast("error", "Error", responseData.message || "Failed to fetch brands")
          setBrands([])
          setCurrentPage(1)
          setTotalPages(1)
          setTotalItems(0)
          return
        }

        // Extract data from the correct structure: data.data.data
        if (
          responseData.data &&
          responseData.data.data &&
          responseData.data.data.data &&
          Array.isArray(responseData.data.data.data)
        ) {
          const brandsList = responseData.data.data.data
          setBrands(brandsList)
          setCurrentPage(responseData.data.meta.current_page)
          setTotalPages(responseData.data.meta.last_page)
          setTotalItems(responseData.data.meta.total)
          console.log("Brands loaded successfully:", brandsList.length, "brands")
        } else {
          console.error("Unexpected API response structure:", responseData)
          setApiError(
            `Unexpected data format from server. Expected array of brands but got: ${typeof responseData.data}`,
          )
          setBrands([])
        }
      } else {
        // Handle error response
        const errorMessage = responseData?.message || `HTTP ${response.status}: ${response.statusText}`
        setApiError(errorMessage)
        addToast("error", "API Error", errorMessage)
        setBrands([])
        console.error("API Error:", errorMessage)
      }
    } catch (error) {
      console.error("Network error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown network error"
      setApiError(`Network error: ${errorMessage}`)
      addToast("error", "Network Error", "Failed to connect to server. Please check your connection.")
      setBrands([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  // Handle view detail
  const handleViewDetail = (brand: BrandData) => {
    setSelectedBrand(brand)
    setIsDetailDialogOpen(true)
  }

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrands()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchBrands(1, searchValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchValue])

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchBrands(page, searchValue)
  }

  // Handle search value change
  const handleSearchValueChange = (value: string) => {
    setSearchValue(value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("")
    setCurrentPage(1)
    fetchBrands(1, "")
  }

  // Statistics based on current data
  const stats = [
    {
      title: "Total Brands",
      value: totalItems.toString(),
      description: "All registered brands",
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "Active Brands",
      value: brands.length.toString(),
      description: "Currently displayed",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "With Images",
      value: brands.filter((brand) => brand.image).length.toString(),
      description: "Brands with images",
      icon: ImageIcon,
      color: "text-blue-600",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getBrandImage = (imagePath: string | null) => {
    if (!imagePath) return "/placeholder.svg?height=40&width=40"

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath

    // Otherwise, construct the full URL
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${imagePath}`
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Brand Management</h1>
            <p className="text-slate-600 mt-2">Loading brand data...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded animate-pulse w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-96">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
              toast.type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === "success" ? (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => removeToast(toast.id)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Brand Management</h1>
          <p className="text-slate-600 mt-2">Manage product brands and their information</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Error Message */}
      {apiError && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <div className="font-medium">Error loading brands:</div>
              <div className="text-sm">{apiError}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApiError("")
                  fetchBrands(currentPage, searchValue)
                }}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-900">Product Brands</CardTitle>
              <CardDescription>
                Showing {brands.length} of {totalItems} brands
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {/* Search Input */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search brands by name..."
                  value={searchValue}
                  onChange={(e) => handleSearchValueChange(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="absolute right-8 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                  </div>
                )}
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-slate-100"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Search Info */}
          {searchValue && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              Searching for brand name "{searchValue}"
              {totalItems > 0 && ` - Found ${totalItems} result${totalItems > 1 ? "s" : ""}`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                          {brand.image ? (
                            <Image
                              src={getBrandImage(brand.image) || "/placeholder.svg"}
                              alt={brand.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          ) : (
                            <Award className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{brand.name}</p>
                          <p className="text-xs text-slate-500">ID: {brand.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs">
                      <p className="truncate">{brand.description || "No description"}</p>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {brand.note ? (
                        <Badge variant="outline" className="text-xs">
                          {brand.note}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">No note</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(brand.created_at)}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(brand.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(brand)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    {searchValue ? `No brands found with name matching "${searchValue}".` : "No brand data available."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isSearching}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={isSearching}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isSearching}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Brand Details</span>
            </DialogTitle>
            <DialogDescription>Detailed information about the selected brand</DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {selectedBrand && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {selectedBrand.image ? (
                      <Image
                        src={getBrandImage(selectedBrand.image) || "/placeholder.svg"}
                        alt={selectedBrand.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=64&width=64"
                        }}
                      />
                    ) : (
                      <Award className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{selectedBrand.name}</h3>
                    <p className="text-slate-600">{selectedBrand.description || "No description"}</p>
                    {selectedBrand.note && (
                      <Badge variant="outline" className="mt-2">
                        {selectedBrand.note}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Brand Name</p>
                        <p className="text-slate-900">{selectedBrand.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Description</p>
                        <p className="text-slate-900">{selectedBrand.description || "No description"}</p>
                      </div>
                    </div>

                    {selectedBrand.note && (
                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Note</p>
                          <p className="text-slate-900">{selectedBrand.note}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Created At</p>
                        <p className="text-slate-900">{formatDateTime(selectedBrand.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Updated At</p>
                        <p className="text-slate-900">{formatDateTime(selectedBrand.updated_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Brand Image</p>
                        <p className="text-slate-900">{selectedBrand.image ? "Available" : "No image"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Image Section */}
                {selectedBrand.image && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Brand Image</h4>
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-white shadow-sm">
                          <Image
                            src={getBrandImage(selectedBrand.image) || "/placeholder.svg"}
                            alt={selectedBrand.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=128&width=128"
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-2">Image path: {selectedBrand.image}</p>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">Brand Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Brand ID:</span>
                      <span className="text-purple-900 font-medium">#{selectedBrand.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Has Image:</span>
                      <span className="text-purple-900 font-medium">{selectedBrand.image ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Has Note:</span>
                      <span className="text-purple-900 font-medium">{selectedBrand.note ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
