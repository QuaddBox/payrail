"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, UserPlus, Info, CheckCircle2, ArrowDownLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useNotification } from "@/components/NotificationProvider"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card border rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function SendCryptoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currency, setCurrency] = React.useState<'STX' | 'BTC'>('STX')
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Send Crypto" 
      description="Transfer BTC or STX directly to another wallet address."
    >
      <div className="space-y-6">
        <div className="flex bg-accent/50 rounded-xl p-1">
          <Button 
            variant={currency === 'STX' ? 'default' : 'ghost'} 
            className="flex-1 rounded-lg h-10 font-bold"
            onClick={() => setCurrency('STX')}
          >
            STX
          </Button>
          <Button 
            variant={currency === 'BTC' ? 'default' : 'ghost'} 
            className="flex-1 rounded-lg h-10 font-bold"
            onClick={() => setCurrency('BTC')}
          >
            BTC
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Recipient Address</Label>
            <Input id="address" placeholder={`Enter ${currency} address...`} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input id="amount" type="number" placeholder="0.00" className="rounded-xl h-12 pr-12 font-mono" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{currency}</span>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Ensure the recipient address matches the selected network ({currency === 'STX' ? 'Stacks' : 'Bitcoin'}). Crypto transfers are final and cannot be reversed.
          </p>
        </div>

        <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-primary group">
          Preview Transaction
          <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Modal>
  )
}

export function AddTeamMemberModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [type, setType] = React.useState<'employee' | 'contractor'>('contractor')

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Team Member" 
      description="Onboard a new employee or contractor to your organization."
    >
      <div className="space-y-6">
        <div className="flex bg-accent/50 rounded-xl p-1 mb-2">
            <Button 
                variant={type === 'employee' ? 'default' : 'ghost'} 
                className="flex-1 rounded-lg h-9 text-sm font-semibold"
                onClick={() => setType('employee')}
            >
                Employee
            </Button>
            <Button 
                variant={type === 'contractor' ? 'default' : 'ghost'} 
                className="flex-1 rounded-lg h-9 text-sm font-semibold"
                onClick={() => setType('contractor')}
            >
                Contractor
            </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Jane Doe" className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stx-address">STX Address</Label>
            <Input id="stx-address" placeholder="SP..." className="rounded-xl h-12 font-mono" />
          </div>
          <div className="space-y-2">
             <div className="flex justify-between">
                <Label htmlFor="rate">{type === 'employee' ? 'Monthly Salary' : 'Hourly Rate'}</Label>
                <span className="text-xs text-muted-foreground">Optional</span>
             </div>
            <div className="relative">
               <Input id="rate" placeholder="0.00" className="rounded-xl h-12 pr-16" />
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground uppercase">
                  {type === 'employee' ? 'STX/mo' : 'STX/hr'}
               </span>
            </div>
          </div>
        </div>

        <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-primary group">
          Onboard {type === 'employee' ? 'Employee' : 'Contractor'}
          <UserPlus className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Modal>
  )
}

export function ReceiveCryptoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currency, setCurrency] = React.useState<'STX' | 'BTC'>('STX')
  const [copied, setCopied] = React.useState(false)
  
  const address = currency === 'STX' 
    ? "SP2J6ZY48GV1EZ5V2V5RB9MPJ43V86650KR5X4" 
    : "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"

  const { showNotification } = useNotification()

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    showNotification("success", "Address Copied", `Your ${currency} address is ready to share.`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Receive Crypto" 
      description="Share this QR code or address to receive payments."
    >
      <div className="space-y-8 flex flex-col items-center">
        
        <div className="flex bg-accent/50 rounded-xl p-1 w-full max-w-[200px] mb-2">
          <Button 
            variant={currency === 'STX' ? 'default' : 'ghost'} 
            className="flex-1 rounded-lg h-8 text-xs font-bold"
            onClick={() => setCurrency('STX')}
          >
            STX
          </Button>
          <Button 
            variant={currency === 'BTC' ? 'default' : 'ghost'} 
            className="flex-1 rounded-lg h-8 text-xs font-bold"
            onClick={() => setCurrency('BTC')}
          >
            BTC
          </Button>
        </div>

        {/* QR Code Placeholder */}
        <div className="relative group">
          <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-sm border-4 border-dashed border-muted-foreground/20 flex items-center justify-center">
             <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full opacity-80">
                {/* Simulated QR Pattern */}
                {[...Array(36)].map((_, i) => (
                    <div key={i} className={`bg-black rounded-sm ${Math.random() > 0.5 ? 'opacity-0' : 'opacity-100'}`} />
                ))}
            </div>
             {/* Center Logo Overlay */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {currency === 'STX' ? (
                       <ArrowDownLeft className="h-6 w-6 text-primary" />
                    ) : (
                       <span className="font-bold text-lg text-orange-500">₿</span>
                    )}
                </div>
             </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="text-center space-y-1">
             <p className="text-sm font-medium text-muted-foreground">Your {currency === 'STX' ? 'Stacks' : 'Bitcoin'} Address</p>
          </div>
          
          <div 
            className="flex items-center gap-2 p-1 pl-4 bg-secondary/50 rounded-2xl border border-border/50 group hover:border-primary/30 transition-colors cursor-pointer"
            onClick={handleCopy}
          >
            <p className="font-mono text-xs sm:text-sm truncate opacity-80 group-hover:opacity-100 transition-opacity">
              {address}
            </p>
            <Button 
                size="icon" 
                variant="ghost" 
                className={cn("rounded-xl ml-auto shrink-0", copied && "text-green-600")}
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className={cn(
            "rounded-xl p-4 text-xs text-center leading-relaxed",
            currency === 'STX' ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300" : "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300"
        )}>
            {currency === 'STX' ? (
                <>Only send <strong>STX</strong> or <strong>SIP-10</strong> tokens to this address.</>
            ) : (
                <>Only send <strong>Bitcoin (BTC)</strong> to this address.</>
            )}
             Sending other assets may result in permanent loss.
        </div>
      </div>
    </Modal>
  )
}
