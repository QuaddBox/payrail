'use client'

import * as React from "react"
import { Send, Calendar, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

// Import the existing client components
import CreatePayrollPage from "@/app/dashboard/payroll/create/CreatePayrollClient"
import ScheduledPayrollPage from "@/app/dashboard/payroll/scheduled/ScheduledPayrollClient"

interface PayrollPageClientProps {
  initialRecipients?: any[]
}

export function PayrollPageClient({ initialRecipients = [] }: PayrollPageClientProps) {
  const [activeTab, setActiveTab] = React.useState<'pay-now' | 'scheduled'>('pay-now')
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {activeTab === 'pay-now' 
              ? 'Execute one-time payments to your team members.' 
              : 'Manage recurring payroll schedules.'}
          </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-accent rounded-2xl p-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab('pay-now')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'pay-now' 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <DollarSign className="h-4 w-4" />
            Pay Now
          </button>
          <button 
            onClick={() => setActiveTab('scheduled')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'scheduled' 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
            Scheduled
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'pay-now' ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <CreatePayrollPage />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <ScheduledPayrollPage initialRecipients={initialRecipients} />
          </div>
        )}
      </div>
    </div>
  )
}
