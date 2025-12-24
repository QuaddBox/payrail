'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const WalletConnect = dynamic(
  () => import('@/components/WalletConnect').then((mod) => mod.WalletConnect),
  { ssr: false, loading: () => <div className="h-20 animate-pulse bg-accent/20 rounded-xl" /> }
)

export default function WalletSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your Stacks wallet connection and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Connected Wallet</CardTitle>
              <CardDescription>
                Your wallet is used to sign transactions and receive STX. Payrail never stores your private keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>Standard security protocols for non-custodial apps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                <Shield className="h-6 w-6 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Encryption Protocol</p>
                  <p className="opacity-80">All interactions between Payrail and your wallet are encrypted locally in your browser.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300">
                <Info className="h-6 w-6 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Transaction Signing</p>
                  <p className="opacity-80">Every STX transfer requires your manual approval in the wallet extension. Payrail cannot move funds without you.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Network Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-bold text-primary italic uppercase tracking-widest text-xs">Testnet</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-muted-foreground">API Status</span>
                <span className="flex items-center gap-1.5 text-green-600 font-bold">
                  <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Online
                </span>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <a href="https://explorer.hiro.so/?chain=testnet" target="_blank" rel="noreferrer">
                  View on Explorer
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <h4 className="font-bold text-sm mb-2">Need a Wallet?</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              We recommend Leather or Hiro Wallet for the best experience on Stacks.
            </p>
            <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
               <a href="https://leather.io/install" target="_blank" rel="noreferrer">Install Leather</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
