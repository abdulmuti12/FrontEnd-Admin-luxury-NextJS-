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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Crown,
  CheckCircle,
  XCircle,
  X,
  Settings,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoleData {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface ApiResponse {
  success?: boolean
  message?: string
  data: {
    data: RoleData[]
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

interface CreateRoleResponse {
  success: boolean
  message: string
  data?: any
}

interface ToastNotification {
  id: string
  type: "success" | "error"
  title: string
  message: string
}

export default function RolePage() {
  const [roles, setRoles] = useState<RoleData[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null)
  const [isCreatingRole, setIsCreatingRole] = useState(false)
  const [createMessage, setCreateMessage] = useState("")
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [newRole, setNewRole] = useState({
    name: "",
  })
  const [apiError, setApiError] = useState("")
  const router = useRouter()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleData | null>(null)

  const [isEditingRole, setIsEditingRole] = useState(false)
  const [editMessage, setEditMessage] = useState("")

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

  // Fetch roles data from API
  const fetchRoles = async (page = 1, value = "") => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      setIsSearching(true)
      setApiError("")

      const params = new URLSearchParams()
      if (page > 1) params.append("page", page.toString())
      if (value.trim()) {
        params.append("name", value.trim())
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/admins/role${params.toString() ? `?${params.toString()}` : ""}`

      console.log("Fetching roles from:", url)

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

      const responseData: ApiResponse = await response.json()
      console.log("API Response:", responseData)

      // Handle successful response
      if (response.ok) {
        // Check if response has success field and it's false
        if (responseData.success === false) {
          setApiError(responseData.message || "API returned success: false")
          addToast("error", "Error", responseData.message || "Failed to fetch roles")
          setRoles([])
          setCurrentPage(1)
          setTotalPages(1)
          setTotalItems(0)
          return
        }

        // Extract data from the nested structure: data.data
        if (responseData.data && responseData.data.data && Array.isArray(responseData.data.data)) {
          const rolesList = responseData.data.data

          // Extract pagination info from meta
          const currentPageNum = responseData.meta.current_page
          const lastPageNum = responseData.meta.last_page
          const totalItemsNum = responseData.meta.total

          setRoles(rolesList)
          setCurrentPage(currentPageNum)
          setTotalPages(lastPageNum)
          setTotalItems(totalItemsNum)

          console.log("Roles loaded:", rolesList.length)
          console.log("Pagination:", { currentPageNum, lastPageNum, totalItemsNum })
        } else {
          console.error("Unexpected API response structure:", responseData)
          setApiError("Received unexpected data format from server")
          setRoles([])
        }
      } else {
        // Handle error response
        if (responseData.message) {
          setApiError(responseData.message)
          addToast("error", "Error", responseData.message)
        } else {
          setApiError(`Error: ${response.status} ${response.statusText}`)
        }
        setRoles([])
      }
    } catch (error) {
      console.error("Role API error:", error)
      setApiError("Network error occurred while fetching roles")
      addToast("error", "Network Error", "Failed to fetch roles. Please check your connection.")
      setRoles([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  // Create new role
  const createRole = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setCreateMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      setIsCreatingRole(true)
      setCreateMessage("")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: newRole.name,
        }),
      })

      const data: CreateRoleResponse = await response.json()

      if (response.status === 401) {
        setCreateMessage("Authentication failed. Please login again.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        setCreateMessage("Role created successfully!")
        addToast("success", "Role Created", `Role "${newRole.name}" has been successfully created.`)
        // Reset form
        setNewRole({
          name: "",
        })
        // Refresh role list
        fetchRoles(currentPage, searchValue)
        // Close dialog after a short delay
        setTimeout(() => {
          setIsAddDialogOpen(false)
          setCreateMessage("")
        }, 2000)
      } else {
        setCreateMessage(data.message || `Failed to create role (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Create role API error:", error)
      setCreateMessage("Network error occurred while creating role")
    } finally {
      setIsCreatingRole(false)
    }
  }

  // Update role
  const updateRole = async (roleId: number) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setEditMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      setIsEditingRole(true)
      setEditMessage("")

      if (!selectedRole) {
        setEditMessage("No role selected for editing")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/role/${roleId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: selectedRole.name,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        setEditMessage("Authentication failed. Please login again.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        // Show success toast
        addToast("success", "Role Updated", `Role "${selectedRole.name}" has been successfully updated.`)
        // Refresh role list
        fetchRoles(currentPage, searchValue)
        // Close dialog after a short delay
        setTimeout(() => {
          setIsEditDialogOpen(false)
          setSelectedRole(null)
          setEditMessage("")
        }, 1000)
      } else {
        setEditMessage(data.message || `Failed to update role (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Update role API error:", error)
      setEditMessage("Network error occurred while updating role")
    } finally {
      setIsEditingRole(false)
    }
  }

  // Delete role
  const deleteRole = async (roleId: number, roleName: string) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/role/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        // Show success toast
        addToast("success", "Role Deleted", `Role "${roleName}" has been successfully deleted.`)
        // Refresh role list after successful deletion
        fetchRoles(currentPage, searchValue)
      } else {
        // Show error toast
        addToast("error", "Delete Failed", data.message || "Failed to delete role. Please try again.")
      }
    } catch (error) {
      console.error("Delete role API error:", error)
      // Show error toast for network errors
      addToast("error", "Network Error", "A network error occurred while deleting the role. Please try again.")
    }
  }

  // Handle view detail
  const handleViewDetail = (role: RoleData) => {
    setSelectedRole(role)
    setIsDetailDialogOpen(true)
  }

  // Handle add dialog open
  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (open) {
      setCreateMessage("")
    } else {
      // Reset form when closing
      setNewRole({
        name: "",
      })
      setCreateMessage("")
    }
  }

  // Initial load
  useEffect(() => {
    fetchRoles()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchRoles(1, searchValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchValue])

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchRoles(page, searchValue)
  }

  // Handle search value change
  const handleSearchValueChange = (value: string) => {
    setSearchValue(value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("")
    setCurrentPage(1)
    fetchRoles(1, "")
  }

  const handleDeleteRole = (role: RoleData) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.id, roleToDelete.name)
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  const handleAddRole = () => {
    if (newRole.name) {
      createRole()
    } else {
      setCreateMessage("Please fill in the role name")
    }
  }

  const handleEditRole = () => {
    if (selectedRole && selectedRole.name) {
      updateRole(selectedRole.id)
    } else {
      setEditMessage("Please fill in the role name")
    }
  }

  // Statistics based on current data
  const stats = [
    {
      title: "Total Roles",
      value: totalItems.toString(),
      description: "All system roles",
      icon: Shield,
      color: "text-purple-600",
    },
    {
      title: "Active Roles",
      value: roles.length.toString(),
      description: "Currently active",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Admin Roles",
      value: roles.filter((role) => role.name.toLowerCase().includes("admin")).length.toString(),
      description: "Administrative roles",
      icon: Crown,
      color: "text-blue-600",
    },
  ]

  const getRoleBadge = (roleName: string) => {
    const colors = {
      "Super Admin": "bg-purple-100 text-purple-800",
      Admin: "bg-blue-100 text-blue-800",
      Moderator: "bg-orange-100 text-orange-800",
      Editor: "bg-green-100 text-green-800",
      User: "bg-gray-100 text-gray-800",
    }
    return (
      <Badge
        className={`${colors[roleName as keyof typeof colors] || "bg-slate-100 text-slate-800"} hover:${colors[roleName as keyof typeof colors] || "bg-slate-100"}`}
      >
        {roleName}
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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
            <p className="text-slate-600 mt-2">Loading role data...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
          <p className="text-slate-600 mt-2">Manage system roles and permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>Create a new system role</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {createMessage && (
                <Alert
                  className={
                    createMessage.includes("successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription
                    className={createMessage.includes("successfully") ? "text-green-800" : "text-red-800"}
                  >
                    {createMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Enter role name"
                  disabled={isCreatingRole}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleAddDialogOpen(false)} disabled={isCreatingRole}>
                Cancel
              </Button>
              <Button onClick={handleAddRole} disabled={isCreatingRole}>
                {isCreatingRole ? "Creating..." : "Create Role"}
              </Button>
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

      {/* API Error Message */}
      {apiError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              <span>Error loading roles: {apiError}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-900">System Roles</CardTitle>
              <CardDescription>
                Showing {roles.length} of {totalItems} roles
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {/* Search Input */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search roles..."
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
              Searching for "{searchValue}"
              {totalItems > 0 && ` - Found ${totalItems} result${totalItems > 1 ? "s" : ""}`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">{getRoleBadge(role.name)}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(role.created_at)}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(role.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(role)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role)
                            setIsEditDialogOpen(true)
                            setEditMessage("")
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
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
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    {searchValue ? `No roles found matching "${searchValue}".` : "No role data available."}
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
              <span>Role Details</span>
            </DialogTitle>
            <DialogDescription>Detailed information about the selected role</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedRole ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{selectedRole.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">{getRoleBadge(selectedRole.name)}</div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Crown className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Role Name</p>
                        <p className="text-slate-900">{selectedRole.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Role ID</p>
                        <p className="text-slate-900">#{selectedRole.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Created At</p>
                        <p className="text-slate-900">{formatDateTime(selectedRole.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Updated At</p>
                        <p className="text-slate-900">{formatDateTime(selectedRole.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">Role Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Role ID:</span>
                      <span className="text-purple-900 font-medium">#{selectedRole.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Role Type:</span>
                      <span className="text-purple-900 font-medium">{selectedRole.name}</span>
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
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedRole(null)
            setEditMessage("")
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="grid gap-4 py-4">
              {editMessage && (
                <Alert
                  className={
                    editMessage.includes("successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription
                    className={editMessage.includes("successfully") ? "text-green-800" : "text-red-800"}
                  >
                    {editMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-name">Role Name *</Label>
                <Input
                  id="edit-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  placeholder="Enter role name"
                  disabled={isEditingRole}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedRole(null)
                setEditMessage("")
              }}
              disabled={isEditingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRole} disabled={isEditingRole}>
              {isEditingRole ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              <span>Delete Role</span>
            </DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the role.</DialogDescription>
          </DialogHeader>

          {roleToDelete && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900">{roleToDelete.name}</p>
                    <p className="text-sm text-red-700">Role ID: #{roleToDelete.id}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Deleting this role will affect all users assigned to this role.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setRoleToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
