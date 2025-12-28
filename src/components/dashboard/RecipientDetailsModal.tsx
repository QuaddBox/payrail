'use client'

import * as React from "react"
import { 
  X, 
  History as HistoryIcon, 
  Settings, 
  Mail, 
  Wallet, 
  Bitcoin, 
  Calendar,
  Clock,
  Copy, 
  ExternalLink,
  Eye 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal, formatTxStatus, TransactionDetailsModal, enrichTransaction, type EnrichedTransaction, truncateAddress } from "@/components/dashboard/ActionModals"
import { Card, CardContent } from "@/components/ui/card"
import { useStacks } from "@/hooks/useStacks"
import { getTeamProfile } from "@/app/actions/team"
import { cn } from "@/lib/utils"
import { useNotification } from "@/components/NotificationProvider"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface RecipientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: any
}

export function RecipientDetailsModal({ isOpen, onClose, recipient }: RecipientDetailsModalProps) {
  const { showNotification } = useNotification()
  const { address, getRecentTransactions, getBusinessInfo, getSTXPrice } = useStacks()
  const [transactions, setTransactions] = React.useState<EnrichedTransaction[]>([])
  const [selectedTx, setSelectedTx] = React.useState<EnrichedTransaction | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const isBrowser = typeof window !== 'undefined'

  React.useEffect(() => {
    async function loadHistory() {
      if (recipient?.wallet_address && isOpen) {
        setIsLoading(true)
        try {
          const txs = await getRecentTransactions(recipient.wallet_address)
          const stxPrice = await getSTXPrice()
          const { data: profile } = await getTeamProfile()
          
          const orgName = profile?.organization_name || profile?.full_name || "My Business"

          // We don't have full team list here effectively, but we know the recipient name from props
          // So we construct a mini-members array with just this recipient to resolve the name correctly in enrichTransaction
          const members = [recipient]
          const enrichedTxs = txs.map((tx: any) => enrichTransaction(tx, members, orgName, address, stxPrice))
          setTransactions(enrichedTxs || [])
        } catch (e) {
          console.error("Error loading recipient history:", e)
          showNotification("error", "Error loading history", "Failed to fetch transaction history for this recipient.")
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadHistory()
  }, [recipient, isOpen, getRecentTransactions, getBusinessInfo, getSTXPrice, address, showNotification])

  if (!recipient) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recipient History"
      description={`Detailed record for ${recipient.name}`}
    >
      <div className="space-y-6">
        {/* Profile Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-accent/10 rounded-2xl border border-primary/5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Payouts</p>
            <p className="text-xl font-bold text-primary">${recipient.rate}</p>
          </div>
          <div className="p-4 bg-accent/10 rounded-2xl border border-primary/5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Frequency</p>
            <p className="text-xl font-bold capitalize">{recipient.payment_frequency}</p>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold">Next Scheduled Payout</p>
              <p className="text-[11px] text-muted-foreground">Automatically triggered every {recipient.payment_frequency}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-primary/10">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Onboarding Status</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950/30 rounded-full text-[10px] font-bold uppercase">Active</span>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <HistoryIcon className="h-4 w-4 text-primary" />
            Recent Activity
            <span className="ml-auto text-[10px] text-primary/60 font-medium px-2 py-0.5 bg-primary/5 rounded border border-primary/10">Live from Stacks</span>
          </h4>
          
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-accent/5 rounded-xl animate-pulse" />
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      tx.senderAddress === address ? "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400" : "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                    )}>
                      {tx.senderAddress === address ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold truncate max-w-[120px]">
                        {tx.txType === 'Contract Call' ? 'Payroll Execution' : 'Transfer'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          tx.rawStatus === 'success' ? "bg-green-500" : "bg-amber-500"
                        )} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted-foreground font-mono">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className={cn(
                        "font-mono text-sm font-bold",
                        tx.senderAddress === address ? "text-primary" : "text-green-600"
                    )}>
                        {tx.senderAddress === address ? '-' : '+'}{tx.amount}
                    </p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => setSelectedTx(tx)}>
                        <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-accent/5 rounded-2xl border border-dashed">
                <p className="text-xs text-muted-foreground">No recent on-chain activity found.</p>
              </div>
            )}
          </div>
        </div>

        <Button className="w-full rounded-xl" variant="outline" onClick={onClose}>
          Close Details
        </Button>
      </div>
      <TransactionDetailsModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        transaction={selectedTx} 
      />
    </Modal>
  )
}
