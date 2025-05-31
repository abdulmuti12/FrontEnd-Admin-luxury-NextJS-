"use client"

import { useState } from "react"
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
import { Plus, Search, Edit, Trash2, Users, UserCheck, Shield } from "lucide-react"

// Sample admin data
const initialAdminData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@admin.com",
    role: "Super Admin",
    status: "Active",
    lastLogin: "2024-01-15 10:30",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@admin.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15 09:15",
    createdAt: "2024-01-02",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@admin.com",
    role: "Moderator",
    status: "Inactive",
    lastLogin: "2024-01-10 14:20",
    createdAt: "2024-01-03",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@admin.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15 11:45",
    createdAt: "2024-01-04",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@admin.com",
    role: "Moderator",
    status: "Active",
    lastLogin: "2024-01-14 16:30",
    createdAt: "2024-01-05",
  },
]

export default function AdminPage() {
  const [admins, setAdmins] = useState(initialAdminData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
  })

  // Filter admins based on search term
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Statistics
  const stats = [
    {
      title: "Total Admins",
      value: admins.length.toString(),
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
      const admin = {
        id: admins.length + 1,
        ...newAdmin,
        lastLogin: "Never",
        createdAt: new Date().toISOString().split("T")[0],
      }
      setAdmins([...admins, admin])
      setNewAdmin({ name: "", email: "", role: "", status: "Active" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditAdmin = () => {
    if (selectedAdmin) {
      setAdmins(admins.map((admin) => (admin.id === selectedAdmin.id ? selectedAdmin : admin)))
      setIsEditDialogOpen(false)
      setSelectedAdmin(null)
    }
  }

  const handleDeleteAdmin = (id: number) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      setAdmins(admins.filter((admin) => admin.id !== id))
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
      <Badge className={`${colors[role as keyof typeof colors]} hover:${colors[role as keyof typeof colors]}`}>
        {role}
      </Badge>
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
              <CardDescription>Manage admin accounts and permissions</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{getRoleBadge(admin.role)}</TableCell>
                  <TableCell>{getStatusBadge(admin.status)}</TableCell>
                  <TableCell className="text-slate-600">{admin.lastLogin}</TableCell>
                  <TableCell className="text-slate-600">{admin.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
