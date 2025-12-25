'use client'

import * as React from "react"
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  Download
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

import { useStacks } from "@/hooks/useStacks"

export function HistoryClient({ initialTransactions = [] }: { initialTransactions?: any[] }) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'sent' | 'received'>('all')
  const { address, getRecentTransactions, isTestnet } = useStacks()
  const [txs, setTxs] = React.useState<any[]>(initialTransactions)
  const [isLoading, setIsLoading] = React.useState(txs.length === 0)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    async function load() {
        if (address) {
            setIsLoading(true)
            const data = await getRecentTransactions(address)
            setTxs(data || [])
            setIsLoading(false)
        }
    }
    if (txs.length === 0 && address) load()
  }, [address, getRecentTransactions, txs.length])

  // Process transactions for display
  const transactions = txs.map(tx => {
    const isSent = tx.sender_address === address
    const amount = isSent 
      ? (tx.stx_sent || tx.token_transfer?.amount || 0) 
      : (tx.stx_received || tx.token_transfer?.amount || 0)
    
    return {
      id: tx.tx_id,
      type: isSent ? "sent" : "received",
      name: isSent ? (tx.tx_type === 'smart_contract' ? (tx.contract_call?.function_name || 'Call') : 'Transfer') : 'Internal',
      amount: `${(Number(amount) / 1_000_000).toLocaleString()} STX`,
      date: new Date(tx.burn_block_time * 1000).toLocaleDateString(),
      status: tx.tx_status === 'success' ? 'Success' : 'Pending',
      txid: tx.tx_id
    }
  })

  if (!isMounted) return null

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground mt-1">A complete record of all your Bitcoin & STX transfers.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-xl">
             <Download className="mr-2 h-4 w-4" />
             Download CSV
           </Button>
        </div>
      </motion.div>

      <motion.div className="flex items-center gap-1 p-1 bg-accent/20 rounded-2xl w-fit" variants={itemVariants}>
        {['all', 'sent', 'received'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
              activeTab === tab ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-6">
             <CardTitle className="text-lg">All Transactions</CardTitle>
             <CardDescription>Filtering by: {activeTab}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={transactions.filter((t: any) => activeTab === 'all' || t.type === activeTab)}
              pageSize={5}
              columns={[
                {
                  header: "Activity",
                  accessorKey: (tx: any) => (
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        tx.type === 'sent' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      )}>
                        {tx.type === 'sent' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <span className="font-bold capitalize">{tx.type}</span>
                    </div>
                  )
                },
                {
                  header: "Recipient/Sender",
                  accessorKey: (tx: any) => <span className="font-semibold">{tx.name}</span>
                },
                {
                  header: "Status",
                  accessorKey: (tx: any) => (
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      tx.status === 'Success' ? "bg-green-100 text-green-700 dark:bg-green-950/30" :
                      tx.status === 'Pending' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30" :
                      "bg-red-100 text-red-700 dark:bg-red-950/30"
                    )}>
                      {tx.status}
                    </span>
                  )
                },
                {
                  header: "Amount",
                  accessorKey: (tx: any) => (
                    <span className={cn(
                      "font-mono font-bold",
                      tx.type === 'received' ? "text-green-600" : ""
                    )}>
                      {tx.type === 'received' ? '+' : '-'}{tx.amount}
                    </span>
                  )
                },
                {
                  header: "Date",
                  accessorKey: "date"
                },
                {
                  header: "",
                  className: "text-right",
                  accessorKey: () => (
                    <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
