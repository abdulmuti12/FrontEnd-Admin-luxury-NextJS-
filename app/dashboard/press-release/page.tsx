"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Eye, Edit, Trash2, FileText, Calendar, Building, ImageIcon, Loader2, AlertCircle } from "lucide-react"

interface PressReleaseData {
  id: number
  name: string
  description: string
  type: string
  brand: string
  status: string
  file: string | null
  file2: string | null
  file3: string | null
  file4: string | null
  file5: string | null
  press_release_date: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    data: {
      data: PressReleaseData[]
    }
    meta: {
      current_page: number
      from: number
      last_page: number
      per_page: number
      to: number
      total: number
    }
  }
  status: number
}

export default function PressReleasePage() {
  const [pressReleases, setPressReleases] = useState<PressReleaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedPressRelease, setSelectedPressRelease] = useState<PressReleaseData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newPressRelease, setNewPressRelease] = useState({
    name: "",
    description: "",
    type: "",
    brand: "",
    status: "",
    press_release_date: "",
    file: null as File | null,
  })

  const [editPressRelease, setEditPressRelease] = useState({
    name: "",
    description: "",
    type: "",
    brand: "",
    status: "",
    press_release_date: "",
    file: null as File | null,
  })

  const fetchPressReleases = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/admins/press-release?page=1", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (data.success) {
        setPressReleases(data.data.data.data)
      } else {
        setError(data.message || "Failed to fetch press releases")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching press releases:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPressReleases()
  }, [])

  const createPressRelease = async () => {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const formData = new FormData()
      formData.append("name", newPressRelease.name)
      formData.append("description", newPressRelease.description)
      formData.append("type", newPressRelease.type)
      formData.append("brand", newPressRelease.brand)
      formData.append("status", newPressRelease.status)
      formData.append("press_release_date", newPressRelease.press_release_date)

      if (newPressRelease.file) {
        formData.append("file", newPressRelease.file)
      }

      const response = await fetch("http://127.0.0.1:8000/api/admins/press-release", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewPressRelease({
          name: "",
          description: "",
          type: "",
          brand: "",
          status: "",
          press_release_date: "",
          file: null,
        })
        fetchPressReleases()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create press release")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updatePressRelease = async () => {
    if (!selectedPressRelease) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const formData = new FormData()
      formData.append("name", editPressRelease.name)
      formData.append("description", editPressRelease.description)
      formData.append("type", editPressRelease.type)
      formData.append("brand", editPressRelease.brand)
      formData.append("status", editPressRelease.status)
      formData.append("press_release_date", editPressRelease.press_release_date)
      formData.append("_method", "PUT")

      if (editPressRelease.file) {
        formData.append("file", editPressRelease.file)
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admins/press-release/${selectedPressRelease.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setSelectedPressRelease(null)
        fetchPressReleases()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update press release")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deletePressRelease = async () => {
    if (!selectedPressRelease) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admins/press-release/${selectedPressRelease.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedPressRelease(null)
        fetchPressReleases()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to delete press release")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (pressRelease: PressReleaseData) => {
    setSelectedPressRelease(pressRelease)
    setEditPressRelease({
      name: pressRelease.name,
      description: pressRelease.description,
      type: pressRelease.type,
      brand: pressRelease.brand,
      status: pressRelease.status,
      press_release_date: pressRelease.press_release_date || "",
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (pressRelease: PressReleaseData) => {
    setSelectedPressRelease(pressRelease)
    setIsDeleteDialogOpen(true)
  }

  const handleDetail = (pressRelease: PressReleaseData) => {
    setSelectedPressRelease(pressRelease)
    setIsDetailDialogOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "image/video":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "text":
        return "bg-green-100 text-green-800 border-green-200"
      case "mixed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "testing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Statistics
  const totalPressReleases = pressReleases.length
  const publishedCount = pressReleases.filter((pr) => pr.status.toLowerCase() === "published").length
  const draftCount = pressReleases.filter((pr) => pr.status.toLowerCase() === "draft").length
  const withDateCount = pressReleases.filter((pr) => pr.press_release_date).length

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📰 Press Release Management</h1>
          <p className="text-muted-foreground">Manage and organize your press releases</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Press Release
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create New Press Release
              </DialogTitle>
              <DialogDescription>Add a new press release to your collection</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={newPressRelease.name}
                  onChange={(e) => setNewPressRelease({ ...newPressRelease, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter press release name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newPressRelease.description}
                  onChange={(e) => setNewPressRelease({ ...newPressRelease, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type *
                </Label>
                <Select
                  value={newPressRelease.type}
                  onValueChange={(value) => setNewPressRelease({ ...newPressRelease, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/video">📸 Image/Video</SelectItem>
                    <SelectItem value="text">📝 Text</SelectItem>
                    <SelectItem value="mixed">🎭 Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right">
                  Brand *
                </Label>
                <Input
                  id="brand"
                  value={newPressRelease.brand}
                  onChange={(e) => setNewPressRelease({ ...newPressRelease, brand: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter brand name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status *
                </Label>
                <Select
                  value={newPressRelease.status}
                  onValueChange={(value) => setNewPressRelease({ ...newPressRelease, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📝 Draft</SelectItem>
                    <SelectItem value="testing">🧪 Testing</SelectItem>
                    <SelectItem value="published">✅ Published</SelectItem>
                    <SelectItem value="archived">📦 Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="press_release_date" className="text-right">
                  Release Date
                </Label>
                <Input
                  id="press_release_date"
                  type="date"
                  value={newPressRelease.press_release_date}
                  onChange={(e) => setNewPressRelease({ ...newPressRelease, press_release_date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setNewPressRelease({ ...newPressRelease, file: e.target.files?.[0] || null })}
                  className="col-span-3"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={createPressRelease}
                disabled={
                  isSubmitting ||
                  !newPressRelease.name ||
                  !newPressRelease.type ||
                  !newPressRelease.brand ||
                  !newPressRelease.status
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Press Release
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Press Releases</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPressReleases}</div>
            <p className="text-xs text-muted-foreground">All press releases</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Badge className="h-4 w-4 bg-green-100 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">Live press releases</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Badge className="h-4 w-4 bg-yellow-100 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{draftCount}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{withDateCount}</div>
            <p className="text-xs text-muted-foreground">With release dates</p>
          </CardContent>
        </Card>
      </div>

      {/* Press Releases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Press Releases
          </CardTitle>
          <CardDescription>Manage your press release collection</CardDescription>
        </CardHeader>
        <CardContent>
          {pressReleases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No press releases</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new press release.</p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Press Release
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pressReleases.map((pressRelease) => (
                  <TableRow key={pressRelease.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{pressRelease.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {pressRelease.description || "No description"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(pressRelease.type)} border`}>
                        {pressRelease.type === "image/video" && <ImageIcon className="h-4 w-4" />}
                        {pressRelease.type === "text" && "📝 "}
                        {pressRelease.type === "mixed" && "🎭 "}
                        {pressRelease.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {pressRelease.brand}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(pressRelease.press_release_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDetail(pressRelease)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pressRelease)}
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pressRelease)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Press Release Details
            </DialogTitle>
          </DialogHeader>
          {selectedPressRelease && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Name:</Label>
                <div className="col-span-3">{selectedPressRelease.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Description:</Label>
                <div className="col-span-3">{selectedPressRelease.description || "No description"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Type:</Label>
                <div className="col-span-3">
                  <Badge className={`${getTypeColor(selectedPressRelease.type)} border`}>
                    {selectedPressRelease.type === "image/video" && <ImageIcon className="h-4 w-4" />}
                    {selectedPressRelease.type === "text" && "📝 "}
                    {selectedPressRelease.type === "mixed" && "🎭 "}
                    {selectedPressRelease.type}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Brand:</Label>
                <div className="col-span-3">{selectedPressRelease.brand}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Status:</Label>
                <div className="col-span-3">
                  <Badge className={`${getStatusColor(selectedPressRelease.status)} border`}>
                    {selectedPressRelease.status === "published" && "✅ "}
                    {selectedPressRelease.status === "draft" && "📝 "}
                    {selectedPressRelease.status === "testing" && "🧪 "}
                    {selectedPressRelease.status === "archived" && "📦 "}
                    {selectedPressRelease.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Release Date:</Label>
                <div className="col-span-3">{formatDate(selectedPressRelease.press_release_date)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Created:</Label>
                <div className="col-span-3">{formatDate(selectedPressRelease.created_at)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Updated:</Label>
                <div className="col-span-3">{formatDate(selectedPressRelease.updated_at)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Press Release
            </DialogTitle>
            <DialogDescription>Update the press release information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={editPressRelease.name}
                onChange={(e) => setEditPressRelease({ ...editPressRelease, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editPressRelease.description}
                onChange={(e) => setEditPressRelease({ ...editPressRelease, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type *
              </Label>
              <Select
                value={editPressRelease.type}
                onValueChange={(value) => setEditPressRelease({ ...editPressRelease, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/video">📸 Image/Video</SelectItem>
                  <SelectItem value="text">📝 Text</SelectItem>
                  <SelectItem value="mixed">🎭 Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-brand" className="text-right">
                Brand *
              </Label>
              <Input
                id="edit-brand"
                value={editPressRelease.brand}
                onChange={(e) => setEditPressRelease({ ...editPressRelease, brand: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status *
              </Label>
              <Select
                value={editPressRelease.status}
                onValueChange={(value) => setEditPressRelease({ ...editPressRelease, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">📝 Draft</SelectItem>
                  <SelectItem value="testing">🧪 Testing</SelectItem>
                  <SelectItem value="published">✅ Published</SelectItem>
                  <SelectItem value="archived">📦 Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-press_release_date" className="text-right">
                Release Date
              </Label>
              <Input
                id="edit-press_release_date"
                type="date"
                value={editPressRelease.press_release_date}
                onChange={(e) => setEditPressRelease({ ...editPressRelease, press_release_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-file" className="text-right">
                File
              </Label>
              <Input
                id="edit-file"
                type="file"
                onChange={(e) => setEditPressRelease({ ...editPressRelease, file: e.target.files?.[0] || null })}
                className="col-span-3"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </div>
            {selectedPressRelease?.file && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Current File:</Label>
                <div className="col-span-3 text-sm text-gray-500">File attached</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={updatePressRelease}
              disabled={
                isSubmitting ||
                !editPressRelease.name ||
                !editPressRelease.type ||
                !editPressRelease.brand ||
                !editPressRelease.status
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Press Release
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Press Release
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this press release? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPressRelease && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{selectedPressRelease.name}</p>
                <p className="text-sm text-gray-600">{selectedPressRelease.brand}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deletePressRelease} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
