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
import { Plus, Edit, Trash2, Eye, Gift, TrendingUp, Calendar, ImageIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface PromotionData {
  id: number
  name: string
  description: string
  note: string
  type: string
  brand: string
  file: string | null
  file2: string | null
  file3: string | null
  file4: string | null
  file5: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    data: {
      data: PromotionData[]
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

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<PromotionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [promotionToEdit, setPromotionToEdit] = useState<PromotionData | null>(null)
  const [promotionToDelete, setPromotionToDelete] = useState<PromotionData | null>(null)
  const [promotionToView, setPromotionToView] = useState<PromotionData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newPromotion, setNewPromotion] = useState({
    name: "",
    description: "",
    note: "",
    type: "",
    brand: "",
    file: null as File | null,
  })

  const [editPromotion, setEditPromotion] = useState({
    name: "",
    description: "",
    note: "",
    type: "",
    brand: "",
    file: null as File | null,
  })

  const getImageUrl = (filePath: string | null): string => {
    if (!filePath) return ""

    // If it's already a full URL, return as is
    if (filePath.startsWith("http")) {
      return filePath
    }

    // If it's a relative path, construct the full URL
    return `http://127.0.0.1:8000/storage/${filePath}`
  }

  const getTypeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "limited":
        return "destructive"
      case "flash":
        return "destructive"
      case "seasonal":
        return "secondary"
      default:
        return "outline"
    }
  }

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/admins/promotion", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      console.log("API Response:", result)

      if (result.success) {
        setPromotions(result.data.data.data)
        setError(null)
      } else {
        setError(result.message || "Failed to fetch promotions")
      }
    } catch (err) {
      console.error("Error fetching promotions:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching promotions")
    } finally {
      setLoading(false)
    }
  }

  const addPromotion = async () => {
    if (!newPromotion.name || !newPromotion.type || !newPromotion.brand) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const formData = new FormData()
      formData.append("name", newPromotion.name)
      formData.append("description", newPromotion.description)
      formData.append("note", newPromotion.note)
      formData.append("type", newPromotion.type)
      formData.append("brand", newPromotion.brand)

      if (newPromotion.file) {
        formData.append("file", newPromotion.file)
      }

      const response = await fetch("http://127.0.0.1:8000/api/admins/promotion", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        await fetchPromotions()
        setIsAddDialogOpen(false)
        setNewPromotion({
          name: "",
          description: "",
          note: "",
          type: "",
          brand: "",
          file: null,
        })
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to add promotion")
      }
    } catch (err) {
      console.error("Error adding promotion:", err)
      setError("An error occurred while adding the promotion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updatePromotion = async () => {
    if (!promotionToEdit || !editPromotion.name || !editPromotion.type || !editPromotion.brand) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const formData = new FormData()
      formData.append("name", editPromotion.name)
      formData.append("description", editPromotion.description)
      formData.append("note", editPromotion.note)
      formData.append("type", editPromotion.type)
      formData.append("brand", editPromotion.brand)
      formData.append("_method", "PUT")

      if (editPromotion.file) {
        formData.append("file", editPromotion.file)
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admins/promotion/${promotionToEdit.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        await fetchPromotions()
        setIsEditDialogOpen(false)
        setPromotionToEdit(null)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update promotion")
      }
    } catch (err) {
      console.error("Error updating promotion:", err)
      setError("An error occurred while updating the promotion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deletePromotion = async () => {
    if (!promotionToDelete) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admins/promotion/${promotionToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchPromotions()
        setIsDeleteDialogOpen(false)
        setPromotionToDelete(null)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to delete promotion")
      }
    } catch (err) {
      console.error("Error deleting promotion:", err)
      setError("An error occurred while deleting the promotion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (promotion: PromotionData) => {
    setPromotionToEdit(promotion)
    setEditPromotion({
      name: promotion.name,
      description: promotion.description,
      note: promotion.note,
      type: promotion.type,
      brand: promotion.brand,
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (promotion: PromotionData) => {
    setPromotionToDelete(promotion)
    setIsDeleteDialogOpen(true)
  }

  const openDetailDialog = (promotion: PromotionData) => {
    setPromotionToView(promotion)
    setIsDetailDialogOpen(true)
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  const stats = {
    total: promotions.length,
    withImages: promotions.filter((p) => p.file).length,
    limited: promotions.filter((p) => p.type === "limited").length,
    regular: promotions.filter((p) => p.type !== "limited").length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
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
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Promotion Management</h1>
          <p className="text-muted-foreground">Manage your promotional campaigns and special offers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Add New Promotion
              </DialogTitle>
              <DialogDescription>
                Create a new promotional campaign. Fill in all the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter promotion name"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right font-medium">
                  Type *
                </Label>
                <Select
                  value={newPromotion.type}
                  onValueChange={(value) => setNewPromotion({ ...newPromotion, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select promotion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">🔥 Limited Time</SelectItem>
                    <SelectItem value="regular">📅 Regular</SelectItem>
                    <SelectItem value="seasonal">🌟 Seasonal</SelectItem>
                    <SelectItem value="flash">⚡ Flash Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right font-medium">
                  Brand *
                </Label>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                  value={newPromotion.brand}
                  onChange={(e) => setNewPromotion({ ...newPromotion, brand: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter promotion description"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                  className="col-span-3 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note" className="text-right font-medium">
                  Note
                </Label>
                <Textarea
                  id="note"
                  placeholder="Additional notes or terms"
                  value={newPromotion.note}
                  onChange={(e) => setNewPromotion({ ...newPromotion, note: e.target.value })}
                  className="col-span-3 min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right font-medium">
                  Image
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPromotion({ ...newPromotion, file: e.target.files?.[0] || null })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addPromotion} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Promotion
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Promotions</CardTitle>
            <Gift className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active promotional campaigns</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withImages}</div>
            <p className="text-xs text-muted-foreground">Promotions with images</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Limited Offers</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.limited}</div>
            <p className="text-xs text-muted-foreground">Time-limited promotions</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regular Offers</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.regular}</div>
            <p className="text-xs text-muted-foreground">Ongoing promotions</p>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Promotions
          </CardTitle>
          <CardDescription>A list of all promotional campaigns in your system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No promotions found</h3>
              <p className="text-sm text-muted-foreground mb-4">Get started by creating your first promotion.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Promotion
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Brand</TableHead>
                  <TableHead className="text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="relative">
                        {promotion.file ? (
                          <img
                            src={getImageUrl(promotion.file) || "/placeholder.svg"}
                            alt={promotion.name}
                            className="h-12 w-12 rounded-lg object-cover border-2 border-border shadow-sm"
                            onError={(e) => {
                              console.error("Failed to load image:", promotion.file)
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-12 w-12 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center ${promotion.file ? "hidden" : ""}`}
                        >
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{promotion.name}</div>
                        {promotion.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                            {promotion.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeVariant(promotion.type)} className="font-medium">
                        {promotion.type === "limited" && "🔥 "}
                        {promotion.type === "flash" && "⚡ "}
                        {promotion.type === "seasonal" && "🌟 "}
                        {promotion.type === "regular" && "📅 "}
                        {promotion.type.charAt(0).toUpperCase() + promotion.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{promotion.brand}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(promotion)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(promotion)}
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(promotion)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
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
              <Eye className="h-5 w-5 text-primary" />
              Promotion Details
            </DialogTitle>
            <DialogDescription>View detailed information about this promotion.</DialogDescription>
          </DialogHeader>
          {promotionToView && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <div className="font-medium">{promotionToView.name}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Brand</Label>
                  <div className="font-medium">{promotionToView.brand}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <Badge variant={getTypeVariant(promotionToView.type)} className="font-medium">
                    {promotionToView.type === "limited" && "🔥 "}
                    {promotionToView.type === "flash" && "⚡ "}
                    {promotionToView.type === "seasonal" && "🌟 "}
                    {promotionToView.type === "regular" && "📅 "}
                    {promotionToView.type.charAt(0).toUpperCase() + promotionToView.type.slice(1)}
                  </Badge>
                </div>
              </div>

              {promotionToView.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">{promotionToView.description}</div>
                </div>
              )}

              {promotionToView.note && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Note</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">{promotionToView.note}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <div className="text-sm">{new Date(promotionToView.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Updated</Label>
                  <div className="text-sm">{new Date(promotionToView.updated_at).toLocaleString()}</div>
                </div>
              </div>

              {promotionToView.file && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Image</Label>
                  <div className="border rounded-lg p-2 bg-muted/50">
                    <img
                      src={getImageUrl(promotionToView.file) || "/placeholder.svg"}
                      alt={promotionToView.name}
                      className="max-w-full h-auto rounded border max-h-64 mx-auto"
                      onError={(e) => {
                        console.error("Failed to load image:", promotionToView.file)
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Promotion
            </DialogTitle>
            <DialogDescription>Make changes to the promotion information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right font-medium">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={editPromotion.name}
                onChange={(e) => setEditPromotion({ ...editPromotion, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right font-medium">
                Type *
              </Label>
              <Select
                value={editPromotion.type}
                onValueChange={(value) => setEditPromotion({ ...editPromotion, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select promotion type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limited">🔥 Limited Time</SelectItem>
                  <SelectItem value="regular">📅 Regular</SelectItem>
                  <SelectItem value="seasonal">🌟 Seasonal</SelectItem>
                  <SelectItem value="flash">⚡ Flash Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-brand" className="text-right font-medium">
                Brand *
              </Label>
              <Input
                id="edit-brand"
                value={editPromotion.brand}
                onChange={(e) => setEditPromotion({ ...editPromotion, brand: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right font-medium">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editPromotion.description}
                onChange={(e) => setEditPromotion({ ...editPromotion, description: e.target.value })}
                className="col-span-3 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-note" className="text-right font-medium">
                Note
              </Label>
              <Textarea
                id="edit-note"
                value={editPromotion.note}
                onChange={(e) => setEditPromotion({ ...editPromotion, note: e.target.value })}
                className="col-span-3 min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-file" className="text-right font-medium">
                New Image
              </Label>
              <Input
                id="edit-file"
                type="file"
                accept="image/*"
                onChange={(e) => setEditPromotion({ ...editPromotion, file: e.target.files?.[0] || null })}
                className="col-span-3"
              />
            </div>
            {promotionToEdit?.file && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Current Image</Label>
                <div className="col-span-3">
                  <img
                    src={getImageUrl(promotionToEdit.file) || "/placeholder.svg"}
                    alt="Current"
                    className="h-20 w-20 rounded object-cover border"
                    onError={(e) => {
                      console.error("Failed to load current image:", promotionToEdit.file)
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updatePromotion} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Promotion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promotion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {promotionToDelete && (
            <div className="py-4 space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {promotionToDelete.name}
                  </div>
                  <div>
                    <strong>Brand:</strong> {promotionToDelete.brand}
                  </div>
                  <div>
                    <strong>Type:</strong> {promotionToDelete.type}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deletePromotion} disabled={isSubmitting}>
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
