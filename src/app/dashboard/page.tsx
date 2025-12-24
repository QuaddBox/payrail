'use client'

import * as React from "react"
import { useAuth } from "@/hooks/useAuth"
import { BusinessDashboard } from "@/components/dashboard/BusinessDashboard"
import { FreelancerDashboard } from "@/components/dashboard/FreelancerDashboard"

export default function DashboardPage() {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (role === 'business') return <BusinessDashboard />
  if (role === 'freelancer') return <FreelancerDashboard />

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
      <div className="animate-pulse bg-primary/20 p-4 rounded-2xl">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold">Finalizing Setup</h2>
        <p className="text-muted-foreground mt-1">We're retrieving your profile details...</p>
      </div>
    </div>
  )
}
