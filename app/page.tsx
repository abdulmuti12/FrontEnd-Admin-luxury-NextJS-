"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = sessionStorage.getItem("isLoggedIn")
      if (isLoggedIn) {
        window.location.href = "/dashboard"
      } else {
        window.location.href = "/login"
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  )
}
