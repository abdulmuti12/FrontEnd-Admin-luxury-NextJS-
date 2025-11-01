"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  ImageIcon,
  FileText,
  Globe,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import ProjectLoading from "./loading"

interface ProjectData {
  id: number
  name: string
  description: string
  note: string | null
  type: "image/video" | "text" | "mixed" | "web" | "mobile"
  brand_id: string
  file: string | null
  file2: string | null
  file3: string | null
  file4: string | null
  file5: string | null
  file6: string | null
  file7: string | null
  file8: string | null
  file9: string | null
  file10: string | null
  created_at: string
  updated_at: string
  architect: string | null
  photo_created: string | null
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
      data: ProjectData[]
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

const PROJECT_TYPES = [
  { value: "image/video", label: "Image/Video", icon: ImageIcon },
  { value: "text", label: "Text", icon: FileText },
  { value: "mixed", label: "Mixed", icon: FolderOpen },
  { value: "web", label: "Web", icon: Globe },
  { value: "mobile", label: "Mobile", icon: Smartphone },
]

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/admins/project`
const STORAGE_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/`

export default function ProjectPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [apiError, setApiError] = useState("")
  const router = useRouter()

  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])
  const [brandsLoading, setBrandsLoading] = useState(false)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [createMessage, setCreateMessage] = useState("")
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    note: "",
    type: "image/video" as "image/video" | "text" | "mixed" | "web" | "mobile",
    brand_id: "",
    architect: "",
    photo_created: "",
  })
  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [projectFile2, setProjectFile2] = useState<File | null>(null)
  const [projectFile3, setProjectFile3] = useState<File | null>(null)
  const [projectFile4, setProjectFile4] = useState<File | null>(null)
  const [projectFile5, setProjectFile5] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [filePreview2, setFilePreview2] = useState<string | null>(null)
  const [filePreview3, setFilePreview3] = useState<string | null>(null)
  const [filePreview4, setFilePreview4] = useState<string | null>(null)
  const [filePreview5, setFilePreview5] = useState<string | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ProjectData | null>(null)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [isLoadingEditData, setIsLoadingEditData] = useState(false)
  const [editMessage, setEditMessage] = useState("")
  const [editProjectData, setEditProjectData] = useState({
    name: "",
    description: "",
    note: "",
    type: "image/video" as "image/video" | "text" | "mixed" | "web" | "mobile",
    brand_id: "",
    architect: "",
    photo_created: "",
  })
  const [editProjectFile, setEditProjectFile] = useState<File | null>(null)
  const [editProjectFile2, setEditProjectFile2] = useState<File | null>(null)
  const [editProjectFile3, setEditProjectFile3] = useState<File | null>(null)
  const [editProjectFile4, setEditProjectFile4] = useState<File | null>(null)
  const [editProjectFile5, setEditProjectFile5] = useState<File | null>(null)
  const [editFilePreview, setEditFilePreview] = useState<string | null>(null)
  const [editFilePreview2, setEditFilePreview2] = useState<string | null>(null)
  const [editFilePreview3, setEditFilePreview3] = useState<string | null>(null)
  const [editFilePreview4, setEditFilePreview4] = useState<string | null>(null)
  const [editFilePreview5, setEditFilePreview5] = useState<string | null>(null)
  const [currentProjectFile, setCurrentProjectFile] = useState<string | null>(null)
  const [currentProjectFile2, setCurrentProjectFile2] = useState<string | null>(null)
  const [currentProjectFile3, setCurrentProjectFile3] = useState<string | null>(null)
  const [currentProjectFile4, setCurrentProjectFile4] = useState<string | null>(null)
  const [currentProjectFile5, setCurrentProjectFile5] = useState<string | null>(null)

  // Toast notification functions
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

  // Fetch projects data from API
  const fetchProjects = useCallback(
    async (page = 1, value = "") => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setApiError("No authentication token found. Please login.")
          setIsLoading(false)
          setIsSearching(false)
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

        const url = `${API_BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`

        console.log("Fetching projects from:", url)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Response status:", response.status)

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
          setProjects([])
          return
        }

        if (response.ok) {
          if (responseData.success === false) {
            setApiError(responseData.message || "API returned success: false")
            addToast("error", "Error", responseData.message || "Failed to fetch projects")
            setProjects([])
            setCurrentPage(1)
            setTotalPages(1)
            setTotalItems(0)
            return
          }

          if (
            responseData.data &&
            responseData.data.data &&
            responseData.data.data.data &&
            Array.isArray(responseData.data.data.data)
          ) {
            const projectsList = responseData.data.data.data
            setProjects(projectsList)
            setCurrentPage(responseData.data.meta.current_page)
            setTotalPages(responseData.data.meta.last_page)
            setTotalItems(responseData.data.meta.total)
            console.log("Projects loaded successfully:", projectsList.length, "projects")
          } else {
            console.error("Unexpected API response structure:", responseData)
            setApiError(
              `Unexpected data format from server. Expected array of projects but got: ${typeof responseData.data}`,
            )
            setProjects([])
          }
        } else {
          const errorMessage = responseData?.message || `HTTP ${response.status}: ${response.statusText}`
          setApiError(errorMessage)
          addToast("error", "API Error", errorMessage)
          setProjects([])
          console.error("API Error:", errorMessage)
        }
      } catch (error) {
        console.error("Network error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown network error"
        setApiError(`Network error: ${errorMessage}`)
        addToast("error", "Network Error", "Failed to connect to server. Please check your connection.")
        setProjects([])
      } finally {
        setIsLoading(false)
        setIsSearching(false)
      }
    },
    [router],
  )

  // Handle view detail
  const handleViewDetail = async (project: ProjectData) => {
    setIsLoadingDetail(true)
    setDetailError("")

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setDetailError("No authentication token found. Please login.")
        setIsLoadingDetail(false)
        return
      }

      const url = `${API_BASE_URL}/${project.id}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        // Map the response to ProjectData
        const detailProject: ProjectData = {
          id: data.data.general.id,
          name: data.data.general.name,
          description: data.data.general.description,
          note: data.data.general.note,
          type: data.data.general.type,
          brand_id: data.data.general.brand,
          file: data.data.general.file,
          file2: data.data.general.file2,
          file3: data.data.general.file3,
          file4: data.data.general.file4,
          file5: data.data.general.file5,
          file6: null,
          file7: null,
          file8: null,
          file9: null,
          file10: null,
          created_at: data.data.general.created_at,
          updated_at: data.data.general.updated_at,
          // Mapped architect and photo_created from API response
          architect: data.data.general.architect,
          photo_created: data.data.general.photo_created,
        }

        setSelectedProject(detailProject)
        setIsDetailDialogOpen(true)
      } else {
        setDetailError(data.message || "Failed to load project details")
        addToast("error", "Error", data.message || "Failed to load project details")
      }
    } catch (error) {
      console.error("Fetch detail error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setDetailError(`Network error: ${errorMessage}`)
      addToast("error", "Network Error", "Failed to load project details")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects()
    }, 100)

    return () => clearTimeout(timer)
  }, [fetchProjects])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchProjects(1, searchValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchValue, fetchProjects])

  useEffect(() => {
    if (isAddDialogOpen || isEditDialogOpen) {
      fetchBrands()
    }
  }, [isAddDialogOpen, isEditDialogOpen])

  // Fetch brands function
  const fetchBrands = async () => {
    setBrandsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("[v0] Authentication token not found")
        setBrandsLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/get-brand`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setBrands(data.data)
      } else {
        console.error("[v0] Failed to fetch brands:", data.message)
      }
    } catch (err) {
      console.error("[v0] Error fetching brands:", err)
    } finally {
      setBrandsLoading(false)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProjects(page, searchValue)
  }

  // Handle search value change
  const handleSearchValueChange = (value: string) => {
    setSearchValue(value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("")
    setCurrentPage(1)
    fetchProjects(1, "")
  }

  // Statistics based on current data
  const totalProjects = totalItems
  const projectsWithFiles = projects.filter((p) => p.file).length
  const imageVideoProjects = projects.filter((p) => p.type === "image/video").length
  const textProjects = projects.filter((p) => p.type === "text").length

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      description: "All registered projects",
      icon: FolderOpen,
      color: "text-blue-600",
    },
    {
      title: "Projects with Files",
      value: projectsWithFiles.toString(),
      description: "Projects with attached images/files",
      icon: ImageIcon,
      color: "text-green-600",
    },
    {
      title: "Image/Video Projects",
      value: imageVideoProjects.toString(),
      description: "Projects primarily featuring visuals",
      icon: ImageIcon,
      color: "text-red-600",
    },
    {
      title: "Text Projects",
      value: textProjects.toString(),
      description: "Projects primarily featuring text content",
      icon: FileText,
      color: "text-purple-600",
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

  const getProjectFileUrl = (filePath: string | null) => {
    if (!filePath) return "/placeholder.svg?height=40&width=40"

    if (filePath.startsWith("http")) return filePath

    return `${STORAGE_BASE_URL}${filePath}`
  }

  // Handle file input change for Add Project
  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileNumber = 1) => {
    const file = e.target.files?.[0] || null

    if (fileNumber === 1) {
      setProjectFile(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    } else if (fileNumber === 2) {
      setProjectFile2(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview2(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview2(null)
      }
    } else if (fileNumber === 3) {
      setProjectFile3(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview3(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview3(null)
      }
    } else if (fileNumber === 4) {
      setProjectFile4(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview4(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview4(null)
      }
    } else if (fileNumber === 5) {
      setProjectFile5(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview5(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview5(null)
      }
    }
  }

  // Handle add dialog open/close
  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      setNewProject({
        name: "",
        description: "",
        note: "",
        type: "image/video",
        brand_id: "",
        architect: "",
        photo_created: "",
      })
      setProjectFile(null)
      setProjectFile2(null)
      setProjectFile3(null)
      setProjectFile4(null)
      setProjectFile5(null)
      setFilePreview(null)
      setFilePreview2(null)
      setFilePreview3(null)
      setFilePreview4(null)
      setFilePreview5(null)
      setCreateMessage("")
    }
  }

  // Create a new project
  const createProject = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setCreateMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      setIsCreatingProject(true)
      setCreateMessage("")

      const formData = new FormData()
      formData.append("name", newProject.name)
      formData.append("description", newProject.description)
      formData.append("type", newProject.type)
      formData.append("brand_id", newProject.brand_id)

      if (newProject.note) {
        formData.append("note", newProject.note)
      }

      if (newProject.architect) {
        formData.append("architect", newProject.architect)
      }

      if (newProject.photo_created) {
        formData.append("photo_created", newProject.photo_created)
      }

      if (projectFile) {
        formData.append("file", projectFile)
      }
      if (projectFile2) {
        formData.append("file2", projectFile2)
      }
      if (projectFile3) {
        formData.append("file3", projectFile3)
      }
      if (projectFile4) {
        formData.append("file4", projectFile4)
      }
      if (projectFile5) {
        formData.append("file5", projectFile5)
      }

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
        addToast("success", "Project Created", `Project "${newProject.name}" has been successfully created.`)
        setNewProject({
          name: "",
          description: "",
          note: "",
          type: "image/video",
          brand_id: "",
          architect: "",
          photo_created: "",
        })
        setProjectFile(null)
        setProjectFile2(null)
        setProjectFile3(null)
        setProjectFile4(null)
        setProjectFile5(null)
        setFilePreview(null)
        setFilePreview2(null)
        setFilePreview3(null)
        setFilePreview4(null)
        setFilePreview5(null)
        fetchProjects(currentPage, searchValue)
        setTimeout(() => {
          setIsAddDialogOpen(false)
          setCreateMessage("")
        }, 2000)
      } else {
        setCreateMessage(data.message || `Failed to create project (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Create project API error:", error)
      setCreateMessage("Network error occurred while creating project")
    } finally {
      setIsCreatingProject(false)
    }
  }

  // Handle add form submission
  const handleAddProject = () => {
    if (!newProject.name || !newProject.description) {
      setCreateMessage("Please fill in all required fields (Name, Description)")
      return
    }
    createProject()
  }

  // Handle delete project
  const handleDeleteProject = (project: ProjectData) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
    setDeleteMessage("")
  }

  // Delete project function
  const deleteProject = async () => {
    if (!projectToDelete) return

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setDeleteMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      setIsDeletingProject(true)
      setDeleteMessage("")

      const response = await fetch(`${API_BASE_URL}/${projectToDelete.id}`, {
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
        addToast("success", "Project Deleted", `Project "${projectToDelete.name}" has been successfully deleted.`)
        fetchProjects(currentPage, searchValue)
        setTimeout(() => {
          setIsDeleteDialogOpen(false)
          setProjectToDelete(null)
          setDeleteMessage("")
        }, 1500)
      } else {
        setDeleteMessage(data.message || `Failed to delete project (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Delete project API error:", error)
      setDeleteMessage("Network error occurred while deleting project")
    } finally {
      setIsDeletingProject(false)
    }
  }

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    if (!isDeletingProject) {
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
      setDeleteMessage("")
    }
  }

  // Handle edit project
  const handleEditProject = async (project: ProjectData) => {
    setProjectToEdit(project)
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

      setEditProjectData({
        name: project.name || "",
        description: project.description || "",
        note: project.note || "",
        type: project.type || "image/video",
        brand_id: project.brand_id || "",
        // Set nilai architect and photo_created from data project
        architect: project.architect || "",
        photo_created: project.photo_created || "",
      })
      setCurrentProjectFile(project.file)
      setCurrentProjectFile2(project.file2)
      setCurrentProjectFile3(project.file3)
      setCurrentProjectFile4(project.file4)
      setCurrentProjectFile5(project.file5)
      setEditFilePreview(null)
      setEditFilePreview2(null)
      setEditFilePreview3(null)
      setEditFilePreview4(null)
      setEditFilePreview5(null)
      setEditProjectFile(null)
      setEditProjectFile2(null)
      setEditProjectFile3(null)
      setEditProjectFile4(null)
      setEditProjectFile5(null)
    } catch (error) {
      console.error("Load project data error:", error)
      setEditMessage("Error loading project data for editing.")
    } finally {
      setIsLoadingEditData(false)
    }
  }

  // Handle edit file change
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileNumber = 1) => {
    const file = e.target.files?.[0] || null

    if (fileNumber === 1) {
      setEditProjectFile(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setEditFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setEditFilePreview(null)
      }
    } else if (fileNumber === 2) {
      setEditProjectFile2(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setEditFilePreview2(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setEditFilePreview2(null)
      }
    } else if (fileNumber === 3) {
      setEditProjectFile3(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setEditFilePreview3(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setEditFilePreview3(null)
      }
    } else if (fileNumber === 4) {
      setEditProjectFile4(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setEditFilePreview4(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setEditFilePreview4(null)
      }
    } else if (fileNumber === 5) {
      setEditProjectFile5(file)
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setEditFilePreview5(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setEditFilePreview5(null)
      }
    }
  }

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    if (!isEditingProject && !isLoadingEditData) {
      setIsEditDialogOpen(false)
      setProjectToEdit(null)
      setEditMessage("")
      setEditProjectData({
        name: "",
        description: "",
        note: "",
        type: "image/video",
        brand_id: "",
        architect: "",
        photo_created: "",
      })
      setEditProjectFile(null)
      setEditProjectFile2(null)
      setEditProjectFile3(null)
      setEditProjectFile4(null)
      setEditProjectFile5(null)
      setEditFilePreview(null)
      setEditFilePreview2(null)
      setEditFilePreview3(null)
      setEditFilePreview4(null)
      setEditFilePreview5(null)
      setCurrentProjectFile(null)
      setCurrentProjectFile2(null)
      setCurrentProjectFile3(null)
      setCurrentProjectFile4(null)
      setCurrentProjectFile5(null)
    }
  }

  // Update project function
  const updateProject = async () => {
    if (!projectToEdit) return

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setEditMessage("Authentication token not found. Please login again.")
        router.push("/login")
        return
      }

      setIsEditingProject(true)
      setEditMessage("")

      const formData = new FormData()
      formData.append("name", editProjectData.name)
      formData.append("description", editProjectData.description)
      formData.append("type", editProjectData.type)
      formData.append("brand_id", editProjectData.brand_id)
      formData.append("_method", "PUT")

      if (editProjectData.note) {
        formData.append("note", editProjectData.note)
      }

      if (editProjectData.architect) {
        formData.append("architect", editProjectData.architect)
      }

      if (editProjectData.photo_created) {
        formData.append("photo_created", editProjectData.photo_created)
      }

      if (editProjectFile) {
        formData.append("file", editProjectFile)
      }
      if (editProjectFile2) {
        formData.append("file2", editProjectFile2)
      }
      if (editProjectFile3) {
        formData.append("file3", editProjectFile3)
      }
      if (editProjectFile4) {
        formData.append("file4", editProjectFile4)
      }
      if (editProjectFile5) {
        formData.append("file5", editProjectFile5)
      }

      const response = await fetch(`${API_BASE_URL}/${projectToEdit.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.status === 401) {
        setEditMessage("Authentication failed. Please login again.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok && data.success) {
        addToast("success", "Project Updated", `Project "${editProjectData.name}" has been successfully updated.`)
        fetchProjects(currentPage, searchValue)
        setTimeout(() => {
          setIsEditDialogOpen(false)
          setProjectToEdit(null)
          setEditMessage("")
        }, 2000)
      } else {
        setEditMessage(data.message || `Failed to update project (Status: ${response.status})`)
      }
    } catch (error) {
      console.error("Update project API error:", error)
      setEditMessage("Network error occurred while updating project")
    } finally {
      setIsEditingProject(false)
    }
  }

  // Handle edit form submission
  const handleUpdateProject = () => {
    if (!editProjectData.name || !editProjectData.description) {
      setEditMessage("Please fill in all required fields (Name, Description)")
      return
    }
    updateProject()
  }

  // File preview component
  const FilePreviewSection = (props: {
    fileNumber: number
    filePreview: string | null
    currentFile: string | null
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemove: () => void
    isLoading: boolean
  }) => {
    return (
      <div className="space-y-2">
        {props.filePreview ? (
          <div className="relative">
            <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50">
              {props.filePreview.startsWith("data:image") ? (
                <Image
                  src={props.filePreview || "/placeholder.svg"}
                  alt={`New file ${props.fileNumber}`}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-blue-100 text-blue-500">
                  <FileText className="h-10 w-10" />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md"
              onClick={props.onRemove}
              disabled={props.isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">New File</div>
          </div>
        ) : props.currentFile ? (
          <div className="relative">
            <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              {props.currentFile.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                <Image
                  src={getProjectFileUrl(props.currentFile) || "/placeholder.svg"}
                  alt={`Current file ${props.fileNumber}`}
                  fill
                  className="object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=160&width=320"
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-500">
                  <FileText className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2 bg-slate-600 text-white text-xs px-2 py-1 rounded">
              Current File
            </div>
          </div>
        ) : (
          <div className="w-full h-40 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No file uploaded</p>
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500">
          {props.filePreview
            ? "New file selected - will replace current file when saved"
            : props.currentFile
              ? "Current file - upload a new file to replace"
              : "Upload a file (optional)"}
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <ProjectLoading />
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
          <h1 className="text-3xl font-bold text-slate-900">Project Management</h1>
          <p className="text-slate-600 mt-2">Manage your projects, including details and associated files.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>Create a new project entry</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
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
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  disabled={isCreatingProject}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description"
                  disabled={isCreatingProject}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={newProject.note}
                  onChange={(e) => setNewProject({ ...newProject, note: e.target.value })}
                  placeholder="Enter additional notes (optional)"
                  disabled={isCreatingProject}
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={newProject.type}
                  onValueChange={(value: "image/video" | "text" | "mixed" | "web" | "mobile") =>
                    setNewProject({ ...newProject, type: value })
                  }
                  disabled={isCreatingProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" /> {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brand_id">Brand ID</Label>
                <Select
                  value={newProject.brand_id}
                  onValueChange={(value) => setNewProject({ ...newProject, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select a brand (optional)"} />
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

              <div className="grid gap-2">
                <Label htmlFor="architect">Architect</Label>
                <Input
                  id="architect"
                  value={newProject.architect}
                  onChange={(e) => setNewProject({ ...newProject, architect: e.target.value })}
                  placeholder="Enter architect name (optional)"
                  disabled={isCreatingProject}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="photo_created">Photo Created</Label>
                <Input
                  id="photo_created"
                  value={newProject.photo_created}
                  onChange={(e) => setNewProject({ ...newProject, photo_created: e.target.value })}
                  placeholder="Enter photo creation date or info (optional)"
                  disabled={isCreatingProject}
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Project Files</h3>
                  <div className="space-y-4">
                    {/* File 1 */}
                    <div className="grid gap-2">
                      <Label htmlFor="file">Project File 1</Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleAddFileChange(e, 1)}
                        disabled={isCreatingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={1}
                        filePreview={filePreview}
                        currentFile={null}
                        onFileChange={(e) => handleAddFileChange(e, 1)}
                        onRemove={() => {
                          setProjectFile(null)
                          setFilePreview(null)
                        }}
                        isLoading={isCreatingProject}
                      />
                    </div>

                    {/* File 2 */}
                    <div className="grid gap-2">
                      <Label htmlFor="file2">Project File 2</Label>
                      <Input
                        id="file2"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleAddFileChange(e, 2)}
                        disabled={isCreatingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={2}
                        filePreview={filePreview2}
                        currentFile={null}
                        onFileChange={(e) => handleAddFileChange(e, 2)}
                        onRemove={() => {
                          setProjectFile2(null)
                          setFilePreview2(null)
                        }}
                        isLoading={isCreatingProject}
                      />
                    </div>

                    {/* File 3 */}
                    <div className="grid gap-2">
                      <Label htmlFor="file3">Project File 3</Label>
                      <Input
                        id="file3"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleAddFileChange(e, 3)}
                        disabled={isCreatingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={3}
                        filePreview={filePreview3}
                        currentFile={null}
                        onFileChange={(e) => handleAddFileChange(e, 3)}
                        onRemove={() => {
                          setProjectFile3(null)
                          setFilePreview3(null)
                        }}
                        isLoading={isCreatingProject}
                      />
                    </div>

                    {/* File 4 */}
                    <div className="grid gap-2">
                      <Label htmlFor="file4">Project File 4</Label>
                      <Input
                        id="file4"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleAddFileChange(e, 4)}
                        disabled={isCreatingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={4}
                        filePreview={filePreview4}
                        currentFile={null}
                        onFileChange={(e) => handleAddFileChange(e, 4)}
                        onRemove={() => {
                          setProjectFile4(null)
                          setFilePreview4(null)
                        }}
                        isLoading={isCreatingProject}
                      />
                    </div>

                    {/* File 5 */}
                    <div className="grid gap-2">
                      <Label htmlFor="file5">Project File 5</Label>
                      <Input
                        id="file5"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleAddFileChange(e, 5)}
                        disabled={isCreatingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={5}
                        filePreview={filePreview5}
                        currentFile={null}
                        onFileChange={(e) => handleAddFileChange(e, 5)}
                        onRemove={() => {
                          setProjectFile5(null)
                          setFilePreview5(null)
                        }}
                        isLoading={isCreatingProject}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleAddDialogOpen(false)} disabled={isCreatingProject}>
                Cancel
              </Button>
              <Button onClick={handleAddProject} disabled={isCreatingProject}>
                {isCreatingProject ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-4">
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
              <div className="font-medium">Error loading projects:</div>
              <div className="text-sm">{apiError}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApiError("")
                  fetchProjects(currentPage, searchValue)
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
              <CardTitle className="text-slate-900">Project List</CardTitle>
              <CardDescription>
                Showing {projects.length} of {totalItems} projects
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search projects by name..."
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

          {searchValue && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              Searching for project name "{searchValue}"
              {totalItems > 0 && ` - Found ${totalItems} result${totalItems > 1 ? "s" : ""}`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">File</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length > 0 ? (
                projects.map((project) => {
                  const ProjectTypeIcon = PROJECT_TYPES.find((type) => type.value === project.type)?.icon || FolderOpen
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                          {project.file ? (
                            <Image
                              src={getProjectFileUrl(project.file) || "/placeholder.svg"}
                              alt={project.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          ) : (
                            <FolderOpen className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <p className="font-medium text-slate-900">{project.name}</p>
                        <p className="text-xs text-slate-500">ID: {project.id}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "flex items-center gap-1",
                            project.type === "image/video" && "bg-red-100 text-red-800 hover:bg-red-100",
                            project.type === "text" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                            project.type === "mixed" && "bg-purple-100 text-purple-800 hover:bg-purple-100",
                            project.type === "web" && "bg-green-100 text-green-800 hover:bg-green-100",
                            project.type === "mobile" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                          )}
                        >
                          <ProjectTypeIcon className="h-3 w-3" />
                          {PROJECT_TYPES.find((type) => type.value === project.type)?.label || project.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{project.brand_id}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(project)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-800"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteProject(project)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {searchValue
                      ? `No projects found with name matching "${searchValue}".`
                      : "No project data available."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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
              <span>Project Details</span>
            </DialogTitle>
            <DialogDescription>Detailed information about the selected project</DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {isLoadingDetail ? (
              <div className="py-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                <span className="ml-2 text-slate-600">Loading project details...</span>
              </div>
            ) : detailError ? (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <div className="space-y-2">
                    <div className="font-medium">Error loading project details:</div>
                    <div className="text-sm">{detailError}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedProject) {
                          handleViewDetail(selectedProject)
                        }
                      }}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              selectedProject && (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                      {selectedProject.file ? (
                        <Image
                          src={getProjectFileUrl(selectedProject.file) || "/placeholder.svg"}
                          alt={selectedProject.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=64&width=64"
                          }}
                        />
                      ) : (
                        <FolderOpen className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">{selectedProject.name}</h3>
                      <p className="text-slate-600">{selectedProject.description || "No description"}</p>
                      {selectedProject.note && (
                        <Badge variant="outline" className="mt-2">
                          {selectedProject.note}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Project Name</p>
                          <p className="text-slate-900">{selectedProject.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Description</p>
                          <p className="text-slate-900">{selectedProject.description || "No description"}</p>
                        </div>
                      </div>

                      {selectedProject.note && (
                        <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">Note</p>
                            <p className="text-slate-900">{selectedProject.note}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Created At</p>
                          <p className="text-slate-900">{formatDateTime(selectedProject.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Updated At</p>
                          <p className="text-slate-900">{formatDateTime(selectedProject.updated_at)}</p>
                        </div>
                      </div>

                      {selectedProject.architect && (
                        <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                          <FolderOpen className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">Architect</p>
                            <p className="text-slate-900">{selectedProject.architect}</p>
                          </div>
                        </div>
                      )}

                      {selectedProject.photo_created && (
                        <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">Photo Created</p>
                            <p className="text-slate-900">{selectedProject.photo_created}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Project Files</p>
                          <p className="text-slate-900">
                            {
                              [
                                selectedProject.file,
                                selectedProject.file2,
                                selectedProject.file3,
                                selectedProject.file4,
                                selectedProject.file5,
                              ].filter((f) => f).length
                            }{" "}
                            files
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Files Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Project Files</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        selectedProject.file,
                        selectedProject.file2,
                        selectedProject.file3,
                        selectedProject.file4,
                        selectedProject.file5,
                      ].map(
                        (file, index) =>
                          file && (
                            <div key={index} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                              <div className="flex justify-center mb-2">
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-white shadow-sm">
                                  {file.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                                    <Image
                                      src={getProjectFileUrl(file) || "/placeholder.svg"}
                                      alt={`Project file ${index + 1}`}
                                      width={96}
                                      height={96}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "/placeholder.svg?height=96&width=96"
                                      }}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-500">
                                      <FileText className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 text-center truncate">File {index + 1}</p>
                            </div>
                          ),
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Project Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Project ID:</span>
                        <span className="text-blue-900 font-medium">#{selectedProject.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Project Type:</span>
                        <span className="text-blue-900 font-medium">
                          {PROJECT_TYPES.find((type) => type.value === selectedProject.type)?.label ||
                            selectedProject.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Brand ID:</span>
                        <span className="text-blue-900 font-medium">{selectedProject.brand_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} disabled={isLoadingDetail}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              <span>Delete Project</span>
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {deleteMessage && (
              <Alert
                className={
                  deleteMessage.includes("successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }
              >
                <AlertDescription
                  className={deleteMessage.includes("successfully") ? "text-green-800" : "text-red-800"}
                >
                  {deleteMessage}
                </AlertDescription>
              </Alert>
            )}

            {projectToDelete && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {projectToDelete.file ? (
                      <Image
                        src={getProjectFileUrl(projectToDelete.file) || "/placeholder.svg"}
                        alt={projectToDelete.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=48&width=48"
                        }}
                      />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{projectToDelete.name}</p>
                    <p className="text-sm text-slate-600">{projectToDelete.description}</p>
                    <p className="text-xs text-slate-500">ID: {projectToDelete.id}</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Are you sure you want to delete this project?</p>
                      <p className="mt-1">
                        Project "{projectToDelete.name}" will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteDialogClose} disabled={isDeletingProject}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteProject}
              disabled={isDeletingProject}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingProject ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project information</DialogDescription>
          </DialogHeader>

          {isLoadingEditData ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
              <span className="ml-2 text-slate-600">Loading project data...</span>
            </div>
          ) : (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
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
                <Label htmlFor="edit-name">Project Name *</Label>
                <Input
                  id="edit-name"
                  value={editProjectData.name}
                  onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                  placeholder="Enter project name"
                  disabled={isEditingProject}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editProjectData.description}
                  onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                  placeholder="Enter project description"
                  disabled={isEditingProject}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-note">Note</Label>
                <Textarea
                  id="edit-note"
                  value={editProjectData.note}
                  onChange={(e) => setEditProjectData({ ...editProjectData, note: e.target.value })}
                  placeholder="Enter additional notes (optional)"
                  disabled={isEditingProject}
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-type">Type *</Label>
                <Select
                  value={editProjectData.type}
                  onValueChange={(value: "image/video" | "text" | "mixed" | "web" | "mobile") =>
                    setEditProjectData({ ...editProjectData, type: value })
                  }
                  disabled={isEditingProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" /> {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-brand_id">Brand ID</Label>
                <Select
                  value={editProjectData.brand_id}
                  onValueChange={(value) => setEditProjectData({ ...editProjectData, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select a brand (optional)"} />
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

              <div className="grid gap-2">
                <Label htmlFor="edit-architect">Architect</Label>
                <Input
                  id="edit-architect"
                  value={editProjectData.architect}
                  onChange={(e) => setEditProjectData({ ...editProjectData, architect: e.target.value })}
                  placeholder="Enter architect name (optional)"
                  disabled={isEditingProject}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-photo_created">Photo Created</Label>
                <Input
                  id="edit-photo_created"
                  value={editProjectData.photo_created}
                  onChange={(e) => setEditProjectData({ ...editProjectData, photo_created: e.target.value })}
                  placeholder="Enter photo creation date or info (optional)"
                  disabled={isEditingProject}
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Project Files</h3>
                  <div className="space-y-4">
                    {/* File 1 */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-file">Project File 1</Label>
                      <Input
                        id="edit-file"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleEditFileChange(e, 1)}
                        disabled={isEditingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={1}
                        filePreview={editFilePreview}
                        currentFile={currentProjectFile}
                        onFileChange={(e) => handleEditFileChange(e, 1)}
                        onRemove={() => {
                          setEditProjectFile(null)
                          setEditFilePreview(null)
                        }}
                        isLoading={isEditingProject}
                      />
                    </div>

                    {/* File 2 */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-file2">Project File 2</Label>
                      <Input
                        id="edit-file2"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleEditFileChange(e, 2)}
                        disabled={isEditingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={2}
                        filePreview={editFilePreview2}
                        currentFile={currentProjectFile2}
                        onFileChange={(e) => handleEditFileChange(e, 2)}
                        onRemove={() => {
                          setEditProjectFile2(null)
                          setEditFilePreview2(null)
                        }}
                        isLoading={isEditingProject}
                      />
                    </div>

                    {/* File 3 */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-file3">Project File 3</Label>
                      <Input
                        id="edit-file3"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleEditFileChange(e, 3)}
                        disabled={isEditingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={3}
                        filePreview={editFilePreview3}
                        currentFile={currentProjectFile3}
                        onFileChange={(e) => handleEditFileChange(e, 3)}
                        onRemove={() => {
                          setEditProjectFile3(null)
                          setEditFilePreview3(null)
                        }}
                        isLoading={isEditingProject}
                      />
                    </div>

                    {/* File 4 */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-file4">Project File 4</Label>
                      <Input
                        id="edit-file4"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleEditFileChange(e, 4)}
                        disabled={isEditingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={4}
                        filePreview={editFilePreview4}
                        currentFile={currentProjectFile4}
                        onFileChange={(e) => handleEditFileChange(e, 4)}
                        onRemove={() => {
                          setEditProjectFile4(null)
                          setEditFilePreview4(null)
                        }}
                        isLoading={isEditingProject}
                      />
                    </div>

                    {/* File 5 */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-file5">Project File 5</Label>
                      <Input
                        id="edit-file5"
                        type="file"
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={(e) => handleEditFileChange(e, 5)}
                        disabled={isEditingProject}
                        className="cursor-pointer"
                      />
                      <FilePreviewSection
                        fileNumber={5}
                        filePreview={editFilePreview5}
                        currentFile={currentProjectFile5}
                        onFileChange={(e) => handleEditFileChange(e, 5)}
                        onRemove={() => {
                          setEditProjectFile5(null)
                          setEditFilePreview5(null)
                        }}
                        isLoading={isEditingProject}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleEditDialogClose} disabled={isEditingProject || isLoadingEditData}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} disabled={isEditingProject || isLoadingEditData}>
              {isEditingProject ? "Updating..." : "Update Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
