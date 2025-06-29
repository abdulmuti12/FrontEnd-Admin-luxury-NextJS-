"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
 } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {  Eye, Edit, Trash2, Plus, Search, X, Tag, TrendingUp, Calendar, Award, Package, ImageIcon,XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CategoryData {
  id: number
  name: string
  description: string
  image: string | null 
  created_at: string   
  updated_at: string
}

interface CategoryResponse {
  success: boolean
  message: string
  data: {
    data: {
      data: CategoryData[]
    }
    meta: {
      current_page: number
      from: number
      last_page: number
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

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState("")
  const [apiError, setApiError] = useState("")
  const router = useRouter()

  // Detail Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [createMessage, setCreateMessage] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null)
  const [newCategory, setNewCategory] = useState({
      id: "",
      name: "",
      description: "",
    })
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  // Handle delete category
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryData | null>(null)
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [isLoadingEditData, setIsLoadingEditData] = useState(false)
  const [editMessage, setEditMessage] = useState("")
  const [editCategory, setEditCategory] = useState({
    id: "",
    name: "",
    description: "",
  })
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [currentCategoryImage, setCurrentCategoryImage] = useState<string | null>(null)


   const addToast = (type: "success" | "error", title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastNotification = { id, type, title, message }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

   const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }


  const fetchCategories = async (page = 1, search = "") => {
    try {
      setLoading(page === 1 && !search)
      setIsSearching(search !== "")

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      let url = `http://127.0.0.1:8000/api/admins/category?page=${page}`
      if (search) {
        url += `&name=${encodeURIComponent(search)}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      const data: CategoryResponse = await response.json()

      if (data.success) {
        setCategories(data.data.data.data)
        setCurrentPage(data.data.meta.current_page)
        setTotalPages(data.data.meta.last_page)
        setTotalCategories(data.data.meta.total)
        setFrom(data.data.meta.from)
        setTo(data.data.meta.to)
        setMessage("")
      } else {
        setMessage(data.message || "Failed to fetch categories")
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setMessage("Network error occurred")
      setCategories([])
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

   // Handle view detail
  const handleViewDetail = (category: CategoryData) => {
    setSelectedCategory(category)
    setDetailDialogOpen(true)
  }
   // Initial load
    useEffect(() => {
      const timer = setTimeout(() => {
        fetchCategories()
      }, 100)
  
      return () => clearTimeout(timer)
    }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    fetchCategories(1, value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
    fetchCategories(1, "")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchCategories(page, searchTerm)
  }
  
  // Handle search value change
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
    fetchCategories(1, "")
  }
  
  // Statistics based on current data
  const stats = [
    {
      title: "Total Categories",
      value: totalCategories.toString(),
      description: "All registered categories",
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "Active Categories",
      value: categories.length.toString(),
      description: "Currently displayed",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "With Images",
      value: categories.filter((category) => category.image).length.toString(),
      description: "Brands with images",
      icon: ImageIcon,
      color: "text-blue-600",
    },
  ]
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

   // Function to get category image URL

 const getCategoryImage = (imagePath: string | null) => {
     if (!imagePath) return "/placeholder.svg?height=40&width=40"
 
     // If it's already a full URL, return as is
     if (imagePath.startsWith("http")) return imagePath
 
     // Otherwise, construct the full URL
     return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${imagePath}`
   }
 
   // Add this function to handle file input change
   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0] || null
     setCategoryImage(file)
 
     // Create preview URL for the selected image
     if (file) {
       const reader = new FileReader()
       reader.onloadend = () => {
         setImagePreview(reader.result as string)
       }
       reader.readAsDataURL(file)
     } else {
       setImagePreview(null)
     }
   }

  const handleAddDialogOpen = (open: boolean) => {
  setIsAddDialogOpen(open)
  if (!open) {
    // Reset form when closing
    setNewCategory({
      id: "",
      name: "",
      description: "",
    })
    setCategoryImage(null)
    setImagePreview(null)
    setCreateMessage("Category created successfully!")
  }
} // ⬅️ TUTUP di sini. JANGAN ADA FUNGSI DI DALAMNYA

  // ...existing code...
const createCategory = async () => {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      setCreateMessage("Authentication token not found. Please login again.")
      router.push("/login")
      
      return
    }

    setIsCreatingCategory(true)
    setCreateMessage("")

    // Create FormData object to handle file upload
    const formData = new FormData()
    formData.append("id", newCategory.id)
    formData.append("name", newCategory.name)

    if (newCategory.description) {
      formData.append("description", newCategory.description)
    }

    if (categoryImage) {
      formData.append("image", categoryImage)
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/category`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type header when using FormData
      },
      body: formData,
    })

    const data = await response.json()

    if (response.status === 401) {
      setCreateMessage("Authentication failed. Please login again.")
      localStorage.removeItem("token")
      router.push("/login")
      return
    }

    if (response.ok && data.success) {
      // Show success toast
      addToast("success", "Category Created", `Category "${newCategory.name}" has been successfully created.`)

      // Reset form
      setNewCategory({
        id: "",
        name: "",
        description: "",
      })
      setCategoryImage(null)
      setImagePreview(null)
      setCreateMessage("Category created successfully!")
      fetchCategories()
      setIsAddDialogOpen(false)
    } else {
      setCreateMessage(data.message || "Failed to create category")
    }
  } catch (error) {
    setCreateMessage("Network error occurred")
  } finally {
    setIsCreatingCategory(false)
  }
}

// Fungsi handleAddCategory HARUS DI LUAR
const handleAddCategory = () => {
  if (!newCategory.name) {
    setCreateMessage("Please enter a category name")
    return
  }
  createCategory()

}

  // Handle delete category
const handleDeleteCategory = (category: CategoryData) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
    setDeleteMessage("")
  }

  // Delete category function
  const deleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setDeleteMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      setIsDeletingCategory(true)
      setDeleteMessage("")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/category/${categoryToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.status === 401) {
        setDeleteMessage("Authentication failed. Please login again.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        // Show success toast
        addToast("success", "Category Deleted", `Category "${categoryToDelete.name}" has been successfully deleted.`)

        // Refresh category list
        fetchCategories(currentPage, searchTerm)

        // Close dialog after a short delay
        setTimeout(() => {
          setIsDeleteDialogOpen(false)
          setCategoryToDelete(null)
          setDeleteMessage("")
        }, 1500)
      } else {
        setDeleteMessage(data.message || `Failed to delete category (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Delete category API error:", error)
      setDeleteMessage("Network error occurred while deleting category")
    } finally {
      setIsDeletingCategory(false)
    }
  }

   // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    if (!isDeletingCategory) {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
      setDeleteMessage("")
    }
  }

      // Handle edit category
  const handleEditCategory = async (category: CategoryData) => {
    setCategoryToEdit(category)
    setIsEditDialogOpen(true)
    setEditMessage("")
    setIsLoadingEditData(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setEditMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/category-edit/${category.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.status === 401) {
        setEditMessage("Authentication failed. Please login again.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        // Populate form with existing data
        setEditCategory({
          id: data.data.id || "",
          name: data.data.name || "",
          description: data.data.description || "",
        })
        setCurrentCategoryImage(data.data.image)
        setEditImagePreview(null)
        setEditCategoryImage(null)
      } else {
        setEditMessage(data.message || `Failed to load category data (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Load brand data API error:", error)
      setEditMessage("Network error occurred while loading brand data")
    } finally {
      setIsLoadingEditData(false)
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">Manage your product categories</p>
        </div>
         <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new product category</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Enter category name"
                  disabled={isCreatingCategory}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Category Image</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isCreatingCategory}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <div className="w-full h-32 rounded-md overflow-hidden border border-slate-200">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Image preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-slate-800/60 hover:bg-slate-800/80 text-white"
                        onClick={() => {
                          setCategoryImage(null)
                          setImagePreview(null)
                        }}
                        disabled={isCreatingCategory}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">Upload a brand logo or image (optional)</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Description</Label>
                <Textarea
                  id="note"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Enter additional notes (optional)"
                  disabled={isCreatingCategory}
                  rows={2}
                />
              </div>
            </div>
             <DialogFooter>
              <Button variant="outline" onClick={() => handleAddDialogOpen(false)} disabled={isCreatingCategory}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={isCreatingCategory}>
                {isCreatingCategory ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                        fetchCategories(currentPage, searchTerm)
                      }}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">All categories in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Categories</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Added this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories by name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 pr-8"
              />
              {searchTerm && (
                <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-6 w-6 p-0" onClick={clearSearch}>
                  <X className="h-3 w-3" />
                </Button>
              )}
              {isSearching && (
                <div className="absolute right-8 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                </div>
              )}
            </div>
          </div>
          {searchTerm && (
            <CardDescription>{isSearching ? "Searching..." : `Search results for "${searchTerm}"`}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {message && <div className="text-center py-8 text-muted-foreground">{message}</div>}

          {!message && categories.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? `No categories found matching "${searchTerm}"` : "No categories found"}
            </div>
          )}

          {!message && categories.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {categories.length > 0 ? (
                categories.map((category) => (
                <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-muted-foreground">{category.description}</div>
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(category.created_at)}</TableCell>
                      <TableCell className="text-slate-600">{formatDate(category.updated_at)}</TableCell>
                  <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-800"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                {searchTerm ? `No categoriess found with name matching "${searchTerm}".` : "No brand data available."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>


              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {from} to {to} of {totalCategories} categories
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>Detailed information about the selected category</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
           <div className="grid gap-4 md:grid-cols-2">
                             <div className="space-y-4">
                               <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                                 <Award className="w-5 h-5 text-purple-600" />
                                 <div>
                                   <p className="text-sm font-medium text-slate-700">Category Name</p>
                                   <p className="text-slate-900">{selectedCategory.name}</p>
                                 </div>
                               </div>

                               {selectedCategory.description && (
                                 <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                                   <ImageIcon className="w-5 h-5 text-green-600" />
                                   <div>
                                     <p className="text-sm font-medium text-slate-700">Description</p>
                                     <p className="text-slate-900">{selectedCategory.description}</p>
                                   </div>
                                 </div>
                               )}
                             </div>
           
                             <div className="space-y-4">
                               <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                                 <Calendar className="w-5 h-5 text-blue-600" />
                                 <div>
                                   <p className="text-sm font-medium text-slate-700">Created At</p>
                                   <p className="text-slate-900">{formatDateTime(selectedCategory.created_at)}</p>
                                 </div>
                               </div>
           
                               <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                                 <Calendar className="w-5 h-5 text-slate-600" />
                                 <div>
                                   <p className="text-sm font-medium text-slate-700">Updated At</p>
                                   <p className="text-slate-900">{formatDateTime(selectedCategory.updated_at)}</p>
                                 </div>
                               </div>
           
                               <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                                 <ImageIcon className="w-5 h-5 text-orange-600" />
                                 <div>
                                   <p className="text-sm font-medium text-slate-700">Category Image</p>
                                   <p className="text-slate-900">{selectedCategory.image ? "Available" : "No image"}</p>
                                 </div>
                               </div>
                             </div>
                           </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
