'use client'

import * as React from "react"
import { 
  Wallet, 
  ArrowDownLeft, 
  Clock, 
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { SendCryptoModal, ReceiveCryptoModal } from "./ActionModals"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
}

export function FreelancerDashboard() {
  const [isSendModalOpen, setIsSendModalOpen] = React.useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = React.useState(false)

  return (
    <>
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Personal Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track your cross-chain earnings and manage your transfers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 px-6 font-semibold"
                onClick={() => setIsReceiveModalOpen(true)}
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Receive
            </Button>
            <Button 
               size="sm" 
               className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20"
               onClick={() => setIsSendModalOpen(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Crypto
            </Button>
          </div>
        </motion.div>

       {/* Stats Grid */}
       <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={itemVariants}>
         {[
           { title: "Total Earnings", value: "14,250 STX", icon: Wallet, color: "text-green-600 bg-green-100 dark:bg-green-950/30" },
           { title: "Last Payment", value: "850 STX", icon: ArrowDownLeft, color: "text-blue-600 bg-blue-100 dark:bg-blue-950/30" },
           { title: "Pending Clearance", value: "200 STX", icon: Clock, color: "text-orange-600 bg-orange-100 dark:bg-orange-950/30" },
         ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-0.5 tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
         ))}
       </motion.div>

       {/* Tables */}
       <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Earnings</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">Download CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground font-medium bg-accent/5">
                      <th className="px-6 py-4 text-left">Sender</th>
                      <th className="px-6 py-4 text-left">Reference</th>
                      <th className="px-6 py-4 text-left">Amount</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { from: "Design Studio Inc.", ref: "UI/UX Freelance Oct", amount: "+850 STX", date: "Oct 24, 2025" },
                      { from: "Tech Solutions LLC", ref: "API Integration", amount: "+2,100 STX", date: "Oct 15, 2025" },
                      { from: "Acme Org", ref: "Consulting", amount: "+500 STX", date: "Oct 10, 2025" },
                    ].map((income, i) => (
                      <tr key={i} className="group hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-6 font-semibold group-hover:text-primary transition-colors">{income.from}</td>
                        <td className="py-4 px-6 text-muted-foreground">{income.ref}</td>
                        <td className="py-4 px-6 font-bold text-green-600 font-mono tracking-tighter">{income.amount}</td>
                        <td className="py-4 px-6 text-right text-muted-foreground">{income.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </CardContent>
        </Card>
       </motion.div>
      </motion.div>

      <SendCryptoModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
      />
      <ReceiveCryptoModal 
        isOpen={isReceiveModalOpen} 
        onClose={() => setIsReceiveModalOpen(false)} 
      />
    </>
  )
}
