'use client'

import * as React from "react"
import { CheckCircle2, ExternalLink, ArrowRight, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  amount: string
  currency: 'STX' | 'BTC'
  txId?: string
}

export function PaymentSuccessModal({
  isOpen,
  onClose,
  recipientName,
  amount,
  currency,
  txId
}: PaymentSuccessModalProps) {
  const [copied, setCopied] = React.useState(false)

  if (!isOpen) return null

  const explorerUrl = txId 
    ? `https://explorer.stacks.co/txid/${txId}?chain=testnet` 
    : null

  const handleCopy = () => {
    if (txId) {
      navigator.clipboard.writeText(txId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon with animation */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative p-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-1 text-green-500">Payment Sent!</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Your payment has been broadcasted to the blockchain.
          </p>
          
          {/* Amount display */}
          <div className="bg-accent/50 rounded-xl p-4 mb-4">
            <p className="text-3xl font-black">
              {amount} <span className="text-primary">{currency}</span>
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              sent to <span className="font-bold text-foreground">{recipientName}</span>
            </p>
          </div>

          {/* Transaction ID */}
          {txId && (
            <div className="bg-accent/30 rounded-xl p-3 text-left">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono flex-1 truncate">
                  {txId}
                </code>
                <button
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/dashboard/history" onClick={onClose}>
            <Button className="w-full rounded-xl font-bold bg-primary shadow-lg shadow-primary/20">
              <ArrowRight className="mr-2 h-4 w-4" />
              View in History
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 w-full">
                <Button variant="outline" className="w-full rounded-xl font-medium text-sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Explorer
                </Button>
              </a>
            )}
            <Button 
              variant="ghost" 
              className="flex-1 rounded-xl font-medium text-sm w-full"
              onClick={onClose}
            >
              Make Another
            </Button>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Transaction may take 1-2 minutes to confirm on the blockchain.
        </p>
      </div>
    </div>
  )
}
