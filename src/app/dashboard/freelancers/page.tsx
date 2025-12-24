'use client'

import * as React from "react"
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Wallet, 
  Trash2,
  Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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

export default function FreelancersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const freelancers = [
    { name: "John Doe", email: "john@example.com", wallet: "SP123...4567", rate: "50 STX/hr", status: "Active", joindate: "Oct 12, 2025" },
    { name: "Jane Smith", email: "jane@example.com", wallet: "SP987...1234", rate: "85 STX/hr", status: "Active", joindate: "Oct 15, 2025" },
    { name: "Alice Brown", email: "alice@example.com", wallet: "SP555...6666", rate: "40 STX/hr", status: "Paused", joindate: "Oct 20, 2025" },
  ]

  const filteredFreelancers = freelancers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage your employees, contractors, and their payment details.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-accent/5 pb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl h-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">Filter</Button>
                <Button variant="outline" size="sm" className="rounded-lg">Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium bg-accent/5">
                    <th className="px-6 py-4 text-left">Member Name</th>
                    <th className="px-6 py-4 text-left">Wallet Address</th>
                    <th className="px-6 py-4 text-left">Rate</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFreelancers.map((f, i) => (
                    <tr key={i} className="group hover:bg-accent/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                            {f.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-mono text-xs bg-accent/30 w-fit px-2 py-1 rounded-lg">
                          <Wallet className="h-3 w-3 text-muted-foreground" />
                          {f.wallet}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">{f.rate}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          f.status === 'Active' ? "bg-green-100 text-green-700 dark:bg-green-950/30" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30"
                        )}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                        <div className="group-hover:hidden">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredFreelancers.length === 0 && (
              <div className="p-12 text-center">
                <div className="bg-accent/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold">No team members found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
