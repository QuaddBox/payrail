'use client'

import * as React from "react"
import { 
  Wallet, 
  ArrowDownLeft, 
  Download,
  Calendar,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { DataTable } from "@/components/dashboard/DataTable"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

export default function PaymentsPage() {
  const incomingPayments = [
    { id: "1", from: "Design Studio Inc.", project: "UI/UX Freelance Oct", amount: "850 STX", date: "Oct 24, 2025", status: "Success", fiat: "~$680.00" },
    { id: "2", from: "Tech Solutions LLC", project: "API Integration", amount: "0.1 BTC", date: "Oct 15, 2025", status: "Success", fiat: "~$6,400.00" },
    { id: "3", from: "Acme Org", project: "Consulting", amount: "500 STX", date: "Oct 10, 2025", status: "Success", fiat: "~$400.00" },
  ]

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incoming Payments</h1>
          <p className="text-muted-foreground mt-1">Detailed record of Bitcoin & STX received for your services.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-xl">
             <Download className="mr-2 h-4 w-4" />
             Earnings Report
           </Button>
        </div>
      </motion.div>

       {/* Stats Grid */}
       <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={itemVariants}>
         {[
           { title: "Total Revenue", value: "3,450 STX / 0.1 BTC", sub: "Last 30 days", icon: Wallet, color: "text-green-600 bg-green-100 dark:bg-green-950/30" },
           { title: "Avg. Payment", value: "1,150 STX", sub: "Per project", icon: ArrowDownLeft, color: "text-blue-600 bg-blue-100 dark:bg-blue-950/30" },
           { title: "Clients", value: "3 Active", sub: "Paying in BTC/STX", icon: Building2, color: "text-purple-600 bg-purple-100 dark:bg-purple-950/30" },
           { title: "Next Expected", value: "500 STX", sub: "Oct 30, 2025", icon: Calendar, color: "text-orange-600 bg-orange-100 dark:bg-orange-950/30" },
         ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className={cn("p-2.5 rounded-xl w-fit mb-4", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-extrabold tracking-tight">{stat.value}</h3>
                  <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
                </div>
              </div>
            </CardContent>
          </Card>
         ))}
       </motion.div>

       <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-lg">Recent Earnings</CardTitle>
              <CardDescription>Verified blockchain payments</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={incomingPayments}
              pageSize={5}
              columns={[
                {
                  header: "Sender",
                  accessorKey: (p) => (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center font-bold text-[10px]">
                        {p.from.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold group-hover:text-primary transition-colors">{p.from}</span>
                    </div>
                  )
                },
                {
                  header: "Reference",
                  accessorKey: (p) => <span className="text-muted-foreground">{p.project}</span>
                },
                {
                  header: "Status",
                  accessorKey: (p) => (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-950/30">
                      {p.status}
                    </span>
                  )
                },
                {
                  header: "Amount",
                  accessorKey: (p) => <span className="font-mono font-bold text-green-600">+{p.amount}</span>
                },
                {
                  header: "Fiat Estimate",
                  className: "text-right",
                  accessorKey: (p) => <span className="font-medium opacity-60 italic">{p.fiat}</span>
                }
              ]}
            />
          </CardContent>
        </Card>
       </motion.div>
    </motion.div>
  )
}
