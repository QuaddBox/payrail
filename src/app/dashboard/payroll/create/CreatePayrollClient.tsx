'use client'

import * as React from "react"
import { Send, UserPlus, Wallet, Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useStacks } from "@/hooks/useStacks"
import { useNotification } from "@/components/NotificationProvider"
import { getTeamMembers } from "@/app/actions/team"
import { Loader2, Search } from "lucide-react"

export default function CreatePayrollPage() {
  const { isConnected, address, connectWallet, executePayroll } = useStacks()
  const { showNotification } = useNotification()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [recipients, setRecipients] = React.useState<any[]>([])
  const [amount, setAmount] = React.useState("")
  const [recipient, setRecipient] = React.useState("")
  const [scheduleType, setScheduleType] = React.useState("one-time")

  React.useEffect(() => {
    async function loadRecipients() {
      try {
        const { data, error } = await getTeamMembers()
        if (error) throw new Error(error)
        setRecipients(data || [])
      } catch (err) {
        showNotification("error", "Failed to load recipients")
      } finally {
        setIsLoading(false)
      }
    }
    loadRecipients()
  }, [])

  const handleExecutePayroll = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    if (!recipient || !amount) {
      showNotification("error", "Please enter recipient and amount")
      return
    }

    try {
      setIsSubmitting(true)
      await executePayroll(recipient, parseFloat(amount))
    } catch (err) {
      // Handled by useStacks
    } finally {
      setIsSubmitting(false)
    }
  }
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ]
  
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Run Payroll</h1>
        <p className="text-muted-foreground mt-1 text-sm">Execute STX payments to your registered recipients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Payroll Configuration</CardTitle>
              <CardDescription>Enter the recipient details and STX amount for this run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Select Recipient Wallet</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={setRecipient}>
                    <SelectTrigger className="pl-10 rounded-xl">
                      <SelectValue placeholder={isLoading ? "Loading recipients..." : "Search or select a registered wallet"} />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.length === 0 && !isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground italic">
                          No recipients found. Please add members first.
                        </div>
                      ) : (
                        recipients.map((r) => (
                          <SelectItem key={r.id} value={r.wallet_address}>
                            {r.wallet_address.substring(0, 5)}...{r.wallet_address.substring(r.wallet_address.length - 4)} ({r.name})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (STX)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-10 rounded-xl" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule Type</Label>
                  <Select defaultValue="one-time" onValueChange={setScheduleType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scheduleType === "weekly" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="dayOfWeek">Payout Day (Weekly)</Label>
                  <Select defaultValue="Monday">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scheduleType === "monthly" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="dayOfMonth">Payout Day (Monthly)</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfMonth.map(day => (
                        <SelectItem key={day} value={day.toString()}>Day {day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="memo">Memo / Reference (Optional)</Label>
                <Input id="memo" placeholder="e.g. Oct UI Support" className="rounded-xl" />
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl flex gap-3 mb-6">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Executing this payroll will trigger a <b>Stacks Wallet popup</b>. Funds will move directly from your wallet to the recipient on-chain.
                  </p>
                </div>
                <Button 
                  onClick={handleExecutePayroll}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-primary group"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  Execute On-Chain Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Wallet Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-mono">
                  {address ? `${address.substring(0, 5)}...${address.substring(address.length - 4)}` : "Not Connected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-bold">850.42 STX</span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Funds are never held by Payrail. You control your private keys.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
