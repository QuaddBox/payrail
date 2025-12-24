"use client";

import * as React from "react";
import { Users, Send, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SendCryptoModal, AddTeamMemberModal } from "./ActionModals";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export function BusinessDashboard() {
  const [isSendModalOpen, setIsSendModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  return (
    <>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Overview</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage global payroll, team onboarding, and cross-chain payouts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 px-6 font-semibold"
                onClick={() => setIsSendModalOpen(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button 
                size="sm" 
                className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20"
                onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        {[
          {
            title: "Total Payroll (Monthly)",
            value: "4,520 STX",
            sub: "+12% from last month",
            icon: Send,
            color: "text-orange-600 bg-orange-100 dark:bg-orange-950/30",
          },
          {
            title: "Active Team",
            value: "12",
            sub: "2 pending onboarding",
            icon: Users,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-950/30",
          },
          {
            title: "Pending Transfers",
            value: "850 STX",
            sub: "3 transactions",
            icon: Clock,
            color: "text-purple-600 bg-purple-100 dark:bg-purple-950/30",
          },
          {
            title: "Success Rate",
            value: "99.8%",
            sub: "Last 30 days",
            icon: CheckCircle2,
            color: "text-green-600 bg-green-100 dark:bg-green-950/30",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {stat.sub}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-1 tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tables/Lists */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={itemVariants}
      >
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Latest STX payroll activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium">
                    <th className="pb-3 text-left">Recipient</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-left">Amount</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    {
                      name: "John Doe",
                      status: "Completed",
                      amount: "250 STX",
                      date: "2 mins ago",
                    },
                    {
                      name: "Jane Smith",
                      status: "Pending",
                      amount: "1,200 STX",
                      date: "1 hour ago",
                    },
                    {
                      name: "Alice Brown",
                      status: "Failed",
                      amount: "400 STX",
                      date: "3 hours ago",
                    },
                    {
                      name: "Bob Wilson",
                      status: "Completed",
                      amount: "800 STX",
                      date: "Yesterday",
                    },
                  ].map((tx, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center font-bold text-[10px]">
                            {tx.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="font-semibold">{tx.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            tx.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/30"
                              : tx.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30"
                              : "bg-red-100 text-red-700 dark:bg-red-950/30"
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold">{tx.amount}</td>
                      <td className="py-4 text-right text-muted-foreground">
                        {tx.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Org Summary */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Run Payroll</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Batch pay your entire team with one transaction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-white/10 rounded-xl space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Total Due</span>
                  <span className="font-bold">2,450 STX</span>
                </div>
                <div className="flex justify-between text-xs opacity-70">
                  <span>Estimated Fiat</span>
                  <span>~$1,850.00</span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full h-12 rounded-xl text-primary font-bold shadow-lg"
              >
                Execute Batch Payment
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "John Doe", rate: "50 STX/hr", earnings: "2,400 STX" },
                {
                  name: "Jane Smith",
                  rate: "80 STX/hr",
                  earnings: "1,900 STX",
                },
                {
                  name: "Bob Wilson",
                  rate: "40 STX/hr",
                  earnings: "1,200 STX",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent group-hover:bg-primary/10 transition-colors" />
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {f.rate}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {f.earnings}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
      </motion.div>

      <SendCryptoModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} />
      <AddTeamMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}
