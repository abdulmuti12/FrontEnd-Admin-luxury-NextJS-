"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingBag, Package, Tag } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/login"
        return
      }
    }
  }, [])

  const stats = [
    {
      title: "Total Admins",
      value: "12",
      description: "Active admin users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "User Roles",
      value: "5",
      description: "Different user roles",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Products",
      value: "248",
      description: "Total products",
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Categories",
      value: "18",
      description: "Product categories",
      icon: Tag,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's what's happening with your admin panel.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Activity</CardTitle>
            <CardDescription>Latest admin panel activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">New product added</p>
                  <p className="text-xs text-slate-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">User role updated</p>
                  <p className="text-xs text-slate-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Category modified</p>
                  <p className="text-xs text-slate-500">10 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Users className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">Add Admin</p>
              </button>
              <button className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Package className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">Add Product</p>
              </button>
              <button className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Tag className="h-5 w-5 text-orange-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">Add Category</p>
              </button>
              <button className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <ShoppingBag className="h-5 w-5 text-green-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">View Orders</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
