'use client'

import * as React from "react"
import { 
  ArrowDownLeft, 
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, Variants } from "framer-motion"
import { SendCryptoModal, ReceiveCryptoModal } from "./ActionModals"
import { FreelancerEarningsStats, RecentEarningsList } from "./FreelancerDashboardComponents"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
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
         <React.Suspense fallback={<div className="h-32 bg-accent/10 animate-pulse rounded-xl col-span-3" />}>
           <FreelancerEarningsStats />
         </React.Suspense>
       </motion.div>

       {/* Tables */}
       <motion.div variants={itemVariants}>
         <React.Suspense fallback={<div className="h-64 bg-accent/5 animate-pulse rounded-xl" />}>
           <RecentEarningsList />
         </React.Suspense>
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
