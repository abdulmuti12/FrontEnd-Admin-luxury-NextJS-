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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Mail,
  User,
  Crown,
  Activity,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminData {
  id: number
  name: string
  email: string
  role: string
  status: string
  last_login: string | null
  created_at: string
  updated_at: string
}

interface AdminDetailData {
  general: {
    id: number
    name: string
    email: string
    role: string
    status: string
    last_login: string | null
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
    data: AdminData[]
    current_page: number
    from: number
    last_page: number
    links: PaginationLink[]
    path: string
    per_page: number
    to: number
    total: number
    first_page_url: string
    last_page_url: string
    prev_page_url: string | null
    next_page_url: string | null
  }
  status: number
}

interface DetailApiResponse {
  success: boolean
  message: string
  data: AdminDetailData
  status: number
}

export default function AdminPage() {
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [searchType, setSearchType] = useState<"name" | "email">("name")
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null)
  const [adminDetail, setAdminDetail] = useState<AdminDetailData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
  })
  const router = useRouter()

  // Fetch admins data from API
  const fetchAdmins = async (page = 1, type: "name" | "email" = "name", value = "") => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      setIsSearching(true)

      const params = new URLSearchParams()
      if (page > 1) params.append("page", page.toString())
      if (value.trim()) {
        params.append(type, value.trim())
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/admins/admin${params.toString() ? `?${params.toString()}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data: ApiResponse = await response.json()

      if (response.ok && data.success) {
        setAdmins(data.data.data)
        setCurrentPage(data.data.current_page)
        setTotalPages(data.data.last_page)
        setTotalItems(data.data.total)
      } else {
        // If API returns success: false, redirect to login
        localStorage.removeItem("token")
        router.push("/login")
      }
    } catch (error) {
      console.error("Admin API error:", error)
      // On network error, redirect to login
      localStorage.removeItem("token")
      router.push("/login")
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  // Fetch admin detail
  const fetchAdminDetail = async (adminId: number) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      setIsLoadingDetail(true)
      setDetailError("")
      setAdminDetail(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/admin/${adminId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data: DetailApiResponse = await response.json()

      if (response.ok && data.success) {
        setAdminDetail(data.data)
      } else {
        setDetailError(data.message || "Failed to load admin details")
      }
    } catch (error) {
      console.error("Admin detail API error:", error)
      setDetailError("Network error occurred while loading admin details")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Handle view detail
  const handleViewDetail = (admin: AdminData) => {
    setSelectedAdmin(admin)
    setIsDetailDialogOpen(true)
    fetchAdminDetail(admin.id)
  }

  // Initial load
  useEffect(() => {
    fetchAdmins()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchAdmins(1, searchType, searchValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchValue, searchType])

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAdmins(page, searchType, searchValue)
  }

  // Handle search type change
  const handleSearchTypeChange = (type: "name" | "email") => {
    setSearchType(type)
    setSearchValue("") // Clear search value when changing type
    setCurrentPage(1)
    fetchAdmins(1, type, "")
  }

  // Handle search value change
  const handleSearchValueChange = (value: string) => {
    setSearchValue(value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("")
    setCurrentPage(1)
    fetchAdmins(1, searchType, "")
  }

  // Statistics based on current data
  const stats = [
    {
      title: "Total Admins",
      value: totalItems.toString(),
      description: "All admin users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Admins",
      value: admins.filter((admin) => admin.status === "Active").length.toString(),
      description: "Currently active",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Super Admins",
      value: admins.filter((admin) => admin.role === "Super Admin").length.toString(),
      description: "Highest privileges",
      icon: Shield,
      color: "text-purple-600",
    },
  ]

  const handleAddAdmin = () => {
    if (newAdmin.name && newAdmin.email && newAdmin.role) {
      // Here you would typically make an API call to add the admin
      // For now, we'll just refresh the data
      fetchAdmins(currentPage, searchType, searchValue)
      setNewAdmin({ name: "", email: "", role: "", status: "Active" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditAdmin = () => {
    if (selectedAdmin) {
      // Here you would typically make an API call to update the admin
      // For now, we'll just refresh the data
      fetchAdmins(currentPage, searchType, searchValue)
      setIsEditDialogOpen(false)
      setSelectedAdmin(null)
    }
  }

  const handleDeleteAdmin = (id: number) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      // Here you would typically make an API call to delete the admin
      // For now, we'll just refresh the data
      fetchAdmins(currentPage, searchType, searchValue)
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Inactive
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      "Super Admin": "bg-purple-100 text-purple-800",
      Admin: "bg-blue-100 text-blue-800",
      Moderator: "bg-orange-100 text-orange-800",
    }
    return (
      <Badge
        className={`${colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"} hover:${colors[role as keyof typeof colors] || "bg-gray-100"}`}
      >
        {role}
      </Badge>
    )
  }

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

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Never"
    return new Date(lastLogin).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Management</h1>
            <p className="text-slate-600 mt-2">Loading admin data...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-600 mt-2">Manage admin users and their permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>Create a new admin user account</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newAdmin.status} onValueChange={(value) => setNewAdmin({ ...newAdmin, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAdmin}>Add Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      {/* Search and Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-900">Admin Users</CardTitle>
              <CardDescription>
                Showing {admins.length} of {totalItems} admin accounts
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {/* Search Type Selector */}
              <Select value={searchType} onValueChange={handleSearchTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Input */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={`Search by ${searchType}...`}
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
              Searching for "{searchValue}" in {searchType} field
              {totalItems > 0 && ` - Found ${totalItems} result${totalItems > 1 ? "s" : ""}`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>{getStatusBadge(admin.status)}</TableCell>
                    <TableCell className="text-slate-600">{formatLastLogin(admin.last_login)}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(admin.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(admin)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    {searchValue
                      ? `No admins found matching "${searchValue}" in ${searchType} field.`
                      : "No admin data available."}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Admin Details</span>
            </DialogTitle>
            <DialogDescription>Detailed information about the selected admin user</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-3 text-slate-600">Loading admin details...</span>
              </div>
            ) : detailError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{detailError}</AlertDescription>
              </Alert>
            ) : adminDetail ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{adminDetail.general.name}</h3>
                    <p className="text-slate-600">{adminDetail.general.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleBadge(adminDetail.general.role)}
                      {getStatusBadge(adminDetail.general.status)}
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Email Address</p>
                        <p className="text-slate-900">{adminDetail.general.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Crown className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Role</p>
                        <p className="text-slate-900">{adminDetail.general.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Status</p>
                        <p className="text-slate-900">{adminDetail.general.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Last Login</p>
                        <p className="text-slate-900">{formatLastLogin(adminDetail.general.last_login)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Created At</p>
                        <p className="text-slate-900">{formatDateTime(adminDetail.general.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Updated At</p>
                        <p className="text-slate-900">{formatDateTime(adminDetail.general.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Admin Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Admin ID:</span>
                      <span className="text-blue-900 font-medium">#{adminDetail.general.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Account Type:</span>
                      <span className="text-blue-900 font-medium">{adminDetail.general.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Account Status:</span>
                      <span className="text-blue-900 font-medium">{adminDetail.general.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update admin user information</DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={selectedAdmin.name}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedAdmin.email}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={selectedAdmin.role}
                  onValueChange={(value) => setSelectedAdmin({ ...selectedAdmin, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedAdmin.status}
                  onValueChange={(value) => setSelectedAdmin({ ...selectedAdmin, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmin}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
