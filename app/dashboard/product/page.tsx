"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ImageIcon,
  User,
  Building2,
  Tag,
  Calendar,
  Clock,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: number
  name: string
  description: string
  category: string | null
  brand: string
  image1: string | null
  image2: string | null
  image3: string | null
  image4: string | null
  image5: string | null
  image6: string | null
  created_at?: string
  updated_at?: string
}

interface Meta {
  current_page: number
  from: number
  last_page: number
  links: {
    url: string | null
    label: string
    active: boolean
  }[]
  path: string
  per_page: number
  to: number
  total: number
}

interface ProductResponse {
  success: boolean
  message: string
  data: {
    data: {
      data: Product[]
    }
    meta: Meta
    links: {
      first: string
      last: string
      prev: string | null
      next: string | null
    }
  }
  status: number
}

export default function ProductPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategory, setSearchCategory] = useState("")
  const [searchBrand, setSearchBrand] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [imageZoomOpen, setImageZoomOpen] = useState(false)

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])
  const [brandsLoading, setBrandsLoading] = useState(false)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    stock_type: "",
    color: "",
  })
  const [imageFiles, setImageFiles] = useState<{
    image1: File | null
    image2: File | null
    image3: File | null
    image4: File | null
    image5: File | null
    image6: File | null
  }>({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
  })

  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: "success" | "error"
  }>({
    show: false,
    message: "",
    type: "success",
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    id: 0,
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    stock_type: "",
    color: "",
  })
  const [editImageFiles, setEditImageFiles] = useState<{
    image1: File | null
    image2: File | null
    image3: File | null
    image4: File | null
    image5: File | null
    image6: File | null
  }>({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
  })
  const [existingImages, setExistingImages] = useState<{
    image1: string | null
    image2: string | null
    image3: string | null
    image4: string | null
    image5: string | null
    image6: string | null
  }>({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
  })

  // Fetch products
  const fetchProducts = async (page = 1, name = "", category = "", brand = "") => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/admins/product?page=${page}`
      if (name) url += `&name=${encodeURIComponent(name)}`
      if (category) url += `&category=${encodeURIComponent(category)}`
      if (brand) url += `&brand=${encodeURIComponent(brand)}`

      const response = await fetch(url, {
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

      const data: ProductResponse = await response.json()

      if (data.success) {
        setProducts(data.data.data.data)
        setCurrentPage(data.data.meta.current_page)
        setTotalPages(data.data.meta.last_page)
        setTotalProducts(data.data.meta.total)
      } else {
        setError(data.message)
        setProducts([])
      }
    } catch (err) {
      setError("Failed to fetch products. Please try again.")
      setProducts([])
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchProducts(currentPage)
  }, [currentPage])

  // Handle search
  const handleSearch = () => {
    setIsSearching(true)
    setCurrentPage(1)
    fetchProducts(1, searchTerm, searchCategory, searchBrand)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setSearchCategory("")
    setSearchBrand("")
    setCurrentPage(1)
    fetchProducts(1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // View product details
  const viewProductDetails = async (product: Product) => {
    setSelectedProduct(null)
    setDetailDialogOpen(true)
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/product/${product.id}`, {
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

      const data = await response.json()

      if (data.success) {
        setSelectedProduct(data.data.general)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Failed to fetch product details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setImageZoomOpen(true)
  }

  // Create product
  const createProduct = async () => {
    setCreateLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("brand_id", formData.brand_id)
      formDataToSend.append("category_id", formData.category_id)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("stock_type", formData.stock_type)
      formDataToSend.append("color", formData.color)

      // Add images (image1 is required, others are nullable)
      if (imageFiles.image1) {
        formDataToSend.append("image1", imageFiles.image1)
      }
      if (imageFiles.image2) {
        formDataToSend.append("image2", imageFiles.image2)
      }
      if (imageFiles.image3) {
        formDataToSend.append("image3", imageFiles.image3)
      }
      if (imageFiles.image4) {
        formDataToSend.append("image4", imageFiles.image4)
      }
      if (imageFiles.image5) {
        formDataToSend.append("image5", imageFiles.image5)
      }
      if (imageFiles.image6) {
        formDataToSend.append("image6", imageFiles.image6)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      const data = await response.json()

      if (data.success) {
        setCreateDialogOpen(false)
        // Show success notification
        setNotification({
          show: true,
          message: "Product created successfully!",
          type: "success",
        })
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)

        // Reset form
        setFormData({
          name: "",
          brand_id: "",
          category_id: "",
          description: "",
          stock_type: "",
          color: "",
        })
        setImageFiles({
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          image5: null,
          image6: null,
        })
        // Refresh products list
        fetchProducts(currentPage)
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to create product",
          type: "error",
        })
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to create product. Please try again.",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
    } finally {
      setCreateLoading(false)
    }
  }

  // Delete product
  const deleteProduct = async () => {
    if (!productToDelete) return

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/product/${productToDelete.id}`, {
        method: "DELETE",
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

      const data = await response.json()

      if (data.success) {
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        // Show success notification
        setNotification({
          show: true,
          message: "Product deleted successfully!",
          type: "success",
        })
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)

        // Refresh products list
        fetchProducts(currentPage)
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to delete product",
          type: "error",
        })
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to delete product. Please try again.",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageChange = (imageKey: keyof typeof imageFiles, file: File | null) => {
    setImageFiles((prev) => ({
      ...prev,
      [imageKey]: file,
    }))
  }

  // Fetch categories
  const fetchCategories = async () => {
    setCategoriesLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/get-category`, {
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

      const data = await response.json()

      if (data.success) {
        setCategories(data.data)
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to fetch categories",
          type: "error",
        })
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to fetch categories. Please try again.",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Fetch brands
  const fetchBrands = async () => {
    setBrandsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/get-brand`, {
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

      const data = await response.json()

      if (data.success) {
        setBrands(data.data)
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to fetch brands",
          type: "error",
        })
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to fetch brands. Please try again.",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
    } finally {
      setBrandsLoading(false)
    }
  }

  useEffect(() => {
    if (createDialogOpen) {
      fetchCategories()
      fetchBrands()
    }
  }, [createDialogOpen])

  // Edit product functions
  const handleEditClick = async (product: Product) => {
    setEditDialogOpen(true)
    setEditLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/edit-product/${product.id}`, {
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

      const data = await response.json()

      if (data.success) {
        const productData = data.data
        setEditFormData({
          id: productData.id,
          name: productData.name,
          brand_id: productData.brand_id.toString(),
          category_id: productData.category_id.toString(),
          description: productData.description,
          stock_type: productData.stock_type,
          color: productData.color,
        })
        setExistingImages({
          image1: productData.image1,
          image2: productData.image2,
          image3: productData.image3,
          image4: productData.image4,
          image5: productData.image5,
          image6: productData.image6,
        })
        // Fetch categories and brands for edit modal
        fetchCategories()
        fetchBrands()
      } else {
        setNotification({
          show: true,
          message: data.message || "Failed to load product data",
          type: "error",
        })
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
        setEditDialogOpen(false)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to load product data. Please try again.",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      setEditDialogOpen(false)
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditImageChange = (imageKey: keyof typeof editImageFiles, file: File | null) => {
    setEditImageFiles((prev) => ({
      ...prev,
      [imageKey]: file,
    }))
  }

  // Update product
  const updateProduct = async () => {
    // Validate required fields
    if (!editFormData.name.trim()) {
      setNotification({
        show: true,
        message: "Product name is required",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      return
    }

    if (!editFormData.brand_id) {
      setNotification({
        show: true,
        message: "Brand is required",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      return
    }

    if (!editFormData.category_id) {
      setNotification({
        show: true,
        message: "Category is required",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      return
    }

    if (!editFormData.description.trim()) {
      setNotification({
        show: true,
        message: "Description is required",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      return
    }

    if (!editFormData.stock_type.trim()) {
      setNotification({
        show: true,
        message: "Stock type is required",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      return
    }

    if (!editFormData.color.trim()) {
      setNotification({
        show: true,
        message: "Color is required",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
      return
    }

    setEditLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("_method", "PUT")
      formDataToSend.append("name", editFormData.name)
      formDataToSend.append("brand_id", editFormData.brand_id)
      formDataToSend.append("category_id", editFormData.category_id)
      formDataToSend.append("description", editFormData.description)
      formDataToSend.append("stock_type", editFormData.stock_type)
      formDataToSend.append("color", editFormData.color)

      // Add all image fields - send new files if selected, otherwise send empty
      if (editImageFiles.image1) {
        formDataToSend.append("image1", editImageFiles.image1)
      }
      if (editImageFiles.image2) {
        formDataToSend.append("image2", editImageFiles.image2)
      }
      if (editImageFiles.image3) {
        formDataToSend.append("image3", editImageFiles.image3)
      }
      if (editImageFiles.image4) {
        formDataToSend.append("image4", editImageFiles.image4)
      }
      if (editImageFiles.image5) {
        formDataToSend.append("image5", editImageFiles.image5)
      }
      if (editImageFiles.image6) {
        formDataToSend.append("image6", editImageFiles.image6)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/product/${editFormData.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      const data = await response.json()

      if (data.success) {
        setEditDialogOpen(false)
        // Show success notification
        setNotification({
          show: true,
          message: "Product updated successfully!",
          type: "success",
        })
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)

        // Reset form
        setEditFormData({
          id: 0,
          name: "",
          brand_id: "",
          category_id: "",
          description: "",
          stock_type: "",
          color: "",
        })
        setEditImageFiles({
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          image5: null,
          image6: null,
        })
        setExistingImages({
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          image5: null,
          image6: null,
        })
        // Refresh products list
        fetchProducts(currentPage)
      } else {
        // Show error notification with server message
        setNotification({
          show: true,
          message: data.message || "Failed to update product. Please try again.",
          type: "error",
        })
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Network error. Failed to update product. Please try again.",
        type: "error",
      })
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 3000)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : "N/A"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative flex-1">
              <Input
                placeholder="Filter by category..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchCategory && (
                <button
                  onClick={() => setSearchCategory("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative flex-1">
              <Input
                placeholder="Filter by brand..."
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchBrand && (
                <button
                  onClick={() => setSearchBrand("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
            {(searchTerm || searchCategory || searchBrand) && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          No products found
                          {searchTerm || searchCategory || searchBrand ? " matching your search criteria" : ""}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>
                          {product.image1 ? (
                            <div className="w-10 h-10 rounded overflow-hidden bg-slate-100">
                              <img
                                src={product.image1 || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {product.brand ? (
                            <Badge variant="outline">{product.brand}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="outline">{product.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewProductDetails(product)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(product)}
                              className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <strong>
                    {products.length} of {totalProducts}
                  </strong>{" "}
                  products
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Detailed information about the selected product.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm text-muted-foreground ml-2">Loading product details...</p>
            </div>
          ) : selectedProduct ? (
            <div className="space-y-4">
              {/* Product Images */}
              <div className="grid grid-cols-6 gap-2">
                {[
                  selectedProduct.image1,
                  selectedProduct.image2,
                  selectedProduct.image3,
                  selectedProduct.image4,
                  selectedProduct.image5,
                  selectedProduct.image6,
                ].map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded overflow-hidden bg-slate-100 flex items-center justify-center"
                  >
                    {image ? (
                      <button
                        onClick={() => handleImageClick(index)}
                        className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${selectedProduct.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                      </button>
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Product Info */}
              <div className="space-y-4">
                {/* Row 1: Name and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                      <p className="font-medium">{selectedProduct.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                      <Tag className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedProduct.category || "None"}</p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Brand and Created At */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <Building2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Brand</p>
                      <p className="font-medium">{selectedProduct.brand || "None"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Created At</p>
                      <p className="font-medium">
                        {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 3: Updated At (single field) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                      <p className="font-medium">
                        {selectedProduct.updated_at ? new Date(selectedProduct.updated_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div></div> {/* Empty space for alignment */}
                </div>

                {/* Row 4: Description (full width) */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full mt-1">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="font-medium mt-1">{selectedProduct.description || "No description available"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load product details</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Image</DialogTitle>
          </DialogHeader>
          {selectedProduct && selectedImageIndex !== null && (
            <div className="flex justify-center">
              <img
                src={
                  [
                    selectedProduct.image1,
                    selectedProduct.image2,
                    selectedProduct.image3,
                    selectedProduct.image4,
                    selectedProduct.image5,
                    selectedProduct.image6,
                  ][selectedImageIndex] || "/placeholder.svg"
                }
                alt={`${selectedProduct.name} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400"
                }}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageZoomOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>Add a new product to your inventory.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Brand *</label>
                <Select value={formData.brand_id} onValueChange={(value) => handleInputChange("brand_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select a brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brandsLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : brands.length > 0 ? (
                      brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-muted-foreground">No brands available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-muted-foreground">No categories available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Stock Type *</label>
                <Input
                  value={formData.stock_type}
                  onChange={(e) => handleInputChange("stock_type", e.target.value)}
                  placeholder="Enter stock type"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Color *</label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  placeholder="Enter color"
                />
              </div>
              <div></div>
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Product Images</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Image 1 *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("image1", e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {imageFiles.image1 && <p className="text-xs text-gray-500 mt-1">{imageFiles.image1.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Image 2</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("image2", e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {imageFiles.image2 && <p className="text-xs text-gray-500 mt-1">{imageFiles.image2.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Image 3</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("image3", e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {imageFiles.image3 && <p className="text-xs text-gray-500 mt-1">{imageFiles.image3.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Image 4</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("image4", e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {imageFiles.image4 && <p className="text-xs text-gray-500 mt-1">{imageFiles.image4.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Image 5</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("image5", e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {imageFiles.image5 && <p className="text-xs text-gray-500 mt-1">{imageFiles.image5.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Image 6</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("image6", e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {imageFiles.image6 && <p className="text-xs text-gray-500 mt-1">{imageFiles.image6.name}</p>}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createProduct} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information.</DialogDescription>
          </DialogHeader>

          {editLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm text-muted-foreground ml-2">Loading product data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Brand *</label>
                  <Select
                    value={editFormData.brand_id}
                    onValueChange={(value) => handleEditInputChange("brand_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select a brand"} />
                    </SelectTrigger>
                    <SelectContent>
                      {brandsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">Loading...</span>
                        </div>
                      ) : brands.length > 0 ? (
                        brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-sm text-muted-foreground">No brands available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select
                    value={editFormData.category_id}
                    onValueChange={(value) => handleEditInputChange("category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">Loading...</span>
                        </div>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-sm text-muted-foreground">No categories available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Type *</label>
                  <Input
                    value={editFormData.stock_type}
                    onChange={(e) => handleEditInputChange("stock_type", e.target.value)}
                    placeholder="Enter stock type"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Color *</label>
                  <Input
                    value={editFormData.color}
                    onChange={(e) => handleEditInputChange("color", e.target.value)}
                    placeholder="Enter color"
                  />
                </div>
                <div></div>
              </div>

              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Product Images</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Image 1</label>
                    {existingImages.image1 && !editImageFiles.image1 && (
                      <div className="mb-2">
                        <img
                          src={existingImages.image1 || "/placeholder.svg"}
                          alt="Current Image 1"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditImageChange("image1", e.target.files?.[0] || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImageFiles.image1 && (
                      <p className="text-xs text-gray-500 mt-1">{editImageFiles.image1.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image 2</label>
                    {existingImages.image2 && !editImageFiles.image2 && (
                      <div className="mb-2">
                        <img
                          src={existingImages.image2 || "/placeholder.svg"}
                          alt="Current Image 2"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditImageChange("image2", e.target.files?.[0] || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImageFiles.image2 && (
                      <p className="text-xs text-gray-500 mt-1">{editImageFiles.image2.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Image 3</label>
                    {existingImages.image3 && !editImageFiles.image3 && (
                      <div className="mb-2">
                        <img
                          src={existingImages.image3 || "/placeholder.svg"}
                          alt="Current Image 3"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditImageChange("image3", e.target.files?.[0] || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImageFiles.image3 && (
                      <p className="text-xs text-gray-500 mt-1">{editImageFiles.image3.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image 4</label>
                    {existingImages.image4 && !editImageFiles.image4 && (
                      <div className="mb-2">
                        <img
                          src={existingImages.image4 || "/placeholder.svg"}
                          alt="Current Image 4"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditImageChange("image4", e.target.files?.[0] || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImageFiles.image4 && (
                      <p className="text-xs text-gray-500 mt-1">{editImageFiles.image4.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Image 5</label>
                    {existingImages.image5 && !editImageFiles.image5 && (
                      <div className="mb-2">
                        <img
                          src={existingImages.image5 || "/placeholder.svg"}
                          alt="Current Image 5"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditImageChange("image5", e.target.files?.[0] || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImageFiles.image5 && (
                      <p className="text-xs text-gray-500 mt-1">{editImageFiles.image5.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image 6</label>
                    {existingImages.image6 && !editImageFiles.image6 && (
                      <div className="mb-2">
                        <img
                          src={existingImages.image6 || "/placeholder.svg"}
                          alt="Current Image 6"
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditImageChange("image6", e.target.files?.[0] || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImageFiles.image6 && (
                      <p className="text-xs text-gray-500 mt-1">{editImageFiles.image6.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateProduct} disabled={editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {productToDelete && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                  {productToDelete.image1 ? (
                    <img
                      src={productToDelete.image1 || "/placeholder.svg"}
                      alt={productToDelete.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-red-900 truncate">{productToDelete.name}</p>
                  <p className="text-sm text-red-700">ID: {productToDelete.id}</p>
                  {productToDelete.brand && <p className="text-sm text-red-600">Brand: {productToDelete.brand}</p>}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setProductToDelete(null)
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteProduct} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
