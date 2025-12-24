'use client'

import { showConnect } from '@stacks/connect'
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Wallet, CheckCircle2, Loader2, Link2Off } from 'lucide-react'

export const WalletConnect = () => {
  const [address, setAddress] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  
  const isTestnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'testnet'
  const network = isTestnet ? STACKS_TESTNET : STACKS_MAINNET
 
  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Payrail',
        icon: '/favicon.ico',
      },
      onFinish: async (payload) => {
        const userData = payload.userSession.loadUserData()
        const stxAddress = isTestnet 
          ? userData.profile.stxAddress.testnet 
          : userData.profile.stxAddress.mainnet
        setAddress(stxAddress)
        
        if (user) {
          setSyncing(true)
          const { error } = await supabase
            .from('profiles')
            .update({ wallet_address: stxAddress })
            .eq('id', user.id)
          
          if (error) {
            console.error('Error syncing wallet address:', error.message)
          }
          setSyncing(false)
        }
      },
      onCancel: () => {
        console.log('Wallet connection cancelled')
      },
    })
  }

  return (
    <div className="w-full">
      {!address ? (
        <Button
          onClick={connectWallet}
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 group"
        >
          <Wallet className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
          Connect Stacks Wallet
        </Button>
      ) : (
        <div className="p-6 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {syncing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">
                {syncing ? 'Syncing Address...' : 'Wallet Linked'}
              </p>
              <p className="text-xs font-mono text-muted-foreground truncate">{address}</p>
            </div>
          </div>
          
          {!syncing && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setAddress(null)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full rounded-xl h-10"
            >
              <Link2Off className="mr-2 h-4 w-4" />
              Disconnect Wallet
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
