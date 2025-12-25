"use client";

import * as React from "react";
import { Send, Plus, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useStacks } from "@/hooks/useStacks";
import { SendCryptoModal, AddTeamMemberModal } from "./ActionModals";
import { BlockchainStats, RecentTransactionsList } from "./BusinessDashboardComponents";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="border-none shadow-sm animate-pulse">
          <CardContent className="p-6 h-[140px] bg-accent/10 rounded-xl" />
        </Card>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <Card className="lg:col-span-2 border-none shadow-sm animate-pulse">
      <CardHeader className="h-20 bg-accent/10 mb-4" />
      <CardContent className="h-64 bg-accent/5" />
    </Card>
  )
}

export function BusinessDashboard({ initialOrgName }: { initialOrgName?: string }) {
  const { user } = useAuth();
  const { isConnected, address, connectWallet } = useStacks();
  const [isMounted, setIsMounted] = React.useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <React.Fragment>
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Organization Overview</h1>
              {isMounted && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1",
                  isConnected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {isConnected ? <ShieldCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {isConnected ? "On-Chain Verified" : "Wallet Not Connected"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">{initialOrgName || user?.user_metadata?.organization || "My Organization"}</span>
              <span className="text-xs opacity-50">•</span>
              {!isMounted ? (
                <div className="h-5 w-24 bg-accent/50 animate-pulse rounded-lg" />
              ) : (
                <code className="text-xs bg-accent/50 px-2 py-0.5 rounded-lg border border-border/50">
                  {address ? `${address.substring(0, 5)}...${address.substring(address.length - 4)}` : "----"}
                </code>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isConnected && (
              <Button onClick={connectWallet} variant="outline" className="rounded-xl border-primary text-primary">
                Connect Wallet
              </Button>
            )}
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

        {/* Stats Grid - Wrapped in Suspense if we had a data-fetching parent, but for now we use skeletons in Client */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {address ? (
              <React.Suspense fallback={<StatSkeleton />}>
                <BlockchainStats address={address} />
              </React.Suspense>
            ) : (
              [1, 2, 3, 4].map(i => (
                <Card key={i} className="border-none shadow-sm opacity-50">
                  <CardContent className="p-6 h-[140px] flex items-center justify-center italic text-xs text-muted-foreground">
                    Connect wallet to view
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>

        {/* Tables/Lists */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={itemVariants}
        >
          {address ? (
            <React.Suspense fallback={<ListSkeleton />}>
              <RecentTransactionsList address={address} />
            </React.Suspense>
          ) : (
            <Card className="lg:col-span-2 border-none shadow-sm h-64 flex items-center justify-center italic text-muted-foreground">
              Recent transactions will appear here after connection.
            </Card>
          )}

          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-lg">Run Payroll</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Batch pay your entire team with one transaction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white/10 rounded-xl space-y-2 mb-6 text-center">
                  <div className="text-xs opacity-70 mb-1">Estimated Batch Total</div>
                  <div className="text-2xl font-black">---- STX</div>
                </div>
                <Link href="/dashboard/payroll/create" className="block">
                  <Button
                    variant="secondary"
                    className="w-full h-12 rounded-xl text-primary font-bold shadow-lg"
                  >
                    Execute Batch Payment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 text-muted-foreground text-sm italic">
                  Complete a payroll to see data
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      <SendCryptoModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} />
      <AddTeamMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </React.Fragment>
  );
}
