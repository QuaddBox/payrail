'use client'

import * as React from "react"
import { 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useStacks } from "@/hooks/useStacks"
import { useNotification } from "@/components/NotificationProvider"
import { Loader2 } from "lucide-react"

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
}

export function PayrollClient({ initialRecipients = [] }: { initialRecipients: any[] }) {
  const [step, setStep] = React.useState(1)
  const [selectedCount, setSelectedCount] = React.useState(0)
  const [currency, setCurrency] = React.useState<'STX' | 'BTC'>('STX')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { isConnected, connectWallet, executePayroll } = useStacks()
  const { showNotification } = useNotification()

  const recipients = initialRecipients.length > 0 ? initialRecipients : [
    { id: 1, name: "John Doe", wallet: "SP123...4567", amount: 250 },
    { id: 2, name: "Jane Smith", wallet: "SP987...1234", amount: 1200 },
    { id: 3, name: "Alice Brown", wallet: "SP555...6666", amount: 400 },
  ]

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Run Payroll</h1>
          <p className="text-muted-foreground mt-1">Select recipients and execute Bitcoin & STX transfers.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("px-3 py-1 rounded-full transition-colors", step >= 1 ? "bg-primary text-primary-foreground" : "bg-accent")}>1</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className={cn("px-3 py-1 rounded-full transition-colors", step >= 2 ? "bg-primary text-primary-foreground" : "bg-accent")}>2</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className={cn("px-3 py-1 rounded-full transition-colors", step >= 3 ? "bg-primary text-primary-foreground" : "bg-accent")}>3</span>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={itemVariants}>
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle>Select Recipients</CardTitle>
                      <CardDescription>Choose which recipients to include in this payroll run.</CardDescription>
                    </div>
                    <div className="flex bg-accent rounded-lg p-1 scale-90 sm:scale-100">
                      <Button 
                        variant={currency === 'STX' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-md h-8 text-xs font-bold"
                        onClick={() => setCurrency('STX')}
                      >
                        STX
                      </Button>
                      <Button 
                        variant={currency === 'BTC' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-md h-8 text-xs font-bold"
                        onClick={() => setCurrency('BTC')}
                      >
                        BTC
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="divide-y border rounded-xl overflow-hidden">
                      {recipients.map((f: any) => (
                        <div key={f.id} className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-4 w-4 border-2 border-primary rounded flex items-center justify-center cursor-pointer" onClick={() => setSelectedCount(prev => prev + 1)}>
                              <div className="h-2.5 w-2.5 bg-primary rounded-sm shadow-sm" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{f.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{f.wallet_address || f.wallet}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative w-36">
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-primary uppercase tracking-widest z-10">{currency}</span>
                              <Input 
                                type="number" 
                                defaultValue={f.rate || f.amount}
                                className="h-9 pr-14 font-extrabold text-right font-mono rounded-lg border-primary/20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full border-2 border-dashed rounded-xl h-12 text-muted-foreground hover:text-primary hover:border-primary/50">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom Recipient
                    </Button>
                  </CardContent>
                  <CardFooter className="bg-accent/5 p-6 flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Selected</p>
                      <p className="text-lg font-bold">{recipients.length} Recipients</p>
                    </div>
                    <Button size="lg" className="rounded-xl px-10 h-12 shadow-lg shadow-primary/20" onClick={() => setStep(2)}>
                      Review Payroll
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Review & Confirm</CardTitle>
                    <CardDescription>Verify the totals before signing the transactions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 rounded-2xl bg-accent/20 border-2 border-dashed border-primary/20 flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Send className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-3xl font-extrabold tracking-tight">TOTAL {currency}</p>
                        <p className="text-sm text-muted-foreground">Payout for {recipients.length} recipients</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Breakdown ({currency})</p>
                      <div className="space-y-2">
                        {recipients.map((f: any) => (
                          <div key={f.id} className="flex justify-between items-center text-sm py-2 border-b border-border/50">
                            <span className="font-medium">{f.name}</span>
                            <span className="font-mono font-bold">{f.rate || f.amount} {currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-accent/5 p-6 flex justify-between gap-4">
                    <Button variant="ghost" className="rounded-xl" onClick={() => setStep(1)}>Back to Selection</Button>
                    <Button 
                      size="lg" 
                      className="rounded-xl px-10 h-12 shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700" 
                      disabled={isSubmitting}
                      onClick={async () => {
                        if (!isConnected) {
                          connectWallet()
                          return
                        }
                        
                        try {
                          setIsSubmitting(true)
                          // For MVP, we execute for each recipient sequentially
                          // In a real app, this would be a single batch transaction contract call
                          for (const r of recipients) {
                             await executePayroll(r.wallet_address || r.wallet, r.rate || r.amount)
                          }
                          setStep(3)
                        } catch (err) {
                          // Handled by useStacks
                        } finally {
                          setIsSubmitting(false)
                        }
                      }}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Confirm & Broadcast
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card className="border-none shadow-sm bg-green-50 dark:bg-green-950/20 ring-1 ring-green-600/20">
                  <CardContent className="py-12 flex flex-col items-center text-center space-y-6">
                    <motion.div 
                      className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-xl shadow-green-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, transition: { type: "spring", delay: 0.2 } }}
                    >
                        <CheckCircle2 className="h-12 w-12" />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">Broadcast Successful!</h2>
                      <p className="text-muted-foreground max-w-sm">
                        The payroll transactions have been broadcast to the {currency === 'STX' ? 'Stacks' : 'Bitcoin'} network. You can track them in your history.
                      </p>
                    </div>
                    <div className="pt-4">
                        <Button size="lg" className="rounded-xl px-12" variant="outline" onClick={() => setStep(1)}>
                          Done
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Wallet Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-bold text-primary text-xs uppercase tracking-widest">Testnet</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-muted-foreground">Safe to Broadcast</span>
                <span className="font-bold text-green-600 italic">YES</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 flex gap-4">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div className="text-xs space-y-2">
               <p className="font-bold">Verification Required</p>
               <p className="opacity-80">Make sure all wallet addresses are correct. {currency} transfers are irreversible.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
