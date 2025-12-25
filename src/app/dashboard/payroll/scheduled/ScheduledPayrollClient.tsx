'use client'

import * as React from "react"
import { Calendar, Clock, AlertCircle, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStacks } from "@/hooks/useStacks"
import { useNotification } from "@/components/NotificationProvider"
import { Loader2 } from "lucide-react"

export default function ScheduledPayrollPage() {
  const { isConnected, connectWallet, executePayroll } = useStacks()
  const { showNotification } = useNotification()
  const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null)
  
  const schedules = [
    { id: "1", recipient: "John Doe", address: "ST2BPM33WRRPYVSYAVRKXKE19SA9YQ1A6WNJHF91", amount: 250, frequency: "Monthly", nextRun: "Nov 01, 2025", status: "Ready" },
    { id: "2", recipient: "Jane Smith", address: "ST3SJ...1W44", amount: 1200, frequency: "Weekly", nextRun: "Oct 28, 2025", status: "Pending" },
  ]

  const handleRunNow = async (item: any) => {
    if (!isConnected) {
      connectWallet()
      return
    }

    try {
      setIsSubmitting(item.id)
      await executePayroll(item.address, item.amount)
    } catch (err: any) {
      // Handled by useStacks
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Payrolls</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage recurring on-chain payment schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {schedules.map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{item.recipient}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 uppercase tracking-wider">
                      {item.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Next Run: {item.nextRun}
                    </span>
                    <span className="font-bold text-foreground">{item.amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {item.status === "Ready" && (
                    <div className="flex items-center gap-2 mr-4 text-amber-600 animate-pulse">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Action Required</span>
                    </div>
                  )}
                  <Button 
                    className="flex-1 md:flex-none rounded-xl font-bold bg-primary px-8"
                    onClick={() => handleRunNow(item)}
                    disabled={isSubmitting === item.id}
                  >
                    {isSubmitting === item.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4 fill-current" />
                    )}
                    Run Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
