"use client"

import { Users, UserCheck, Package, Tag, Home, Settings, Award, Megaphone } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Admin",
    url: "/dashboard/admin",
    icon: Users,
  },
  {
    title: "Role",
    url: "/dashboard/role",
    icon: UserCheck,
  },
  {
    title: "Product",
    url: "/dashboard/product",
    icon: Package,
  },
  {
    title: "Brand",
    url: "/dashboard/brand",
    icon: Award,
  },
  {
    title: "Category",
    url: "/dashboard/category",
    icon: Tag,
  },
  {
    title: "Campaign",
    url: "/dashboard/campaign",
    icon: Megaphone,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  >
                    <a href={item.url} className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="text-xs text-slate-500 text-center">© 2024 Admin Panel</div>
      </SidebarFooter>
    </Sidebar>
  )
}
