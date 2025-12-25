"use client";

import * as React from "react";
import { Send, Wallet, CheckCircle2, Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStacks } from "@/hooks/useStacks";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Skeleton for the stats
function StatSkeleton() {
  return (
    <Card className="border-none shadow-sm animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-lg bg-accent/50" />
          <div className="h-4 w-12 bg-accent/30 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-accent/30 rounded" />
          <div className="h-8 w-20 bg-accent/50 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-component for Blockchain Stats
export function BlockchainStats({ address }: { address: string }) {
  const { getBusinessInfo, getSTXBalance, getRecentTransactions, getSTXPrice } = useStacks();
  const [data, setData] = React.useState<{
    balance: number | null;
    usdBalance: number | null;
    status: string;
    paid: number;
    paidUsd: number;
    members: number;
    stxPrice: number;
  }>({ balance: null, usdBalance: null, status: "Checking...", paid: 0, paidUsd: 0, members: 0, stxPrice: 0 });

  React.useEffect(() => {
    const fetch = async () => {
      if (!address) return;
      try {
        const [statusData, stxBalance, txData, price] = await Promise.all([
          getBusinessInfo(address),
          getSTXBalance(address),
          getRecentTransactions(address),
          getSTXPrice()
        ]);

        const totalPaid = (txData || [])
          .filter((tx: any) => tx.tx_status === 'success' && tx.sender_address === address)
          .reduce((acc: number, tx: any) => {
             const amt = tx.stx_sent || tx.token_transfer?.amount || 0;
             return acc + (Number(amt) / 1_000_000);
          }, 0);

        const activeFreelancers = new Set(
          (txData || [])
            .filter((tx: any) => tx.tx_status === 'success' && tx.tx_type === 'smart_contract' && tx.sender_address === address)
            .map((tx: any) => tx.contract_call?.function_args?.[0]?.repr)
            .filter(Boolean)
        ).size;

        setData({
          balance: stxBalance,
          usdBalance: stxBalance !== null ? stxBalance * price : null,
          status: statusData?.isRegistered ? "Registered" : "Unregistered",
          paid: totalPaid,
          paidUsd: totalPaid * price,
          members: activeFreelancers,
          stxPrice: price
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetch();

    // Polling for real-time updates every 15 seconds
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [address, getBusinessInfo, getSTXBalance, getRecentTransactions, getSTXPrice]);

  const stats = [
    { 
      title: "Total Paid (On-Chain)", 
      value: `${data.paid.toLocaleString()} STX`, 
      usdValue: `$${data.paidUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "Total Payroll", 
      icon: Send, 
      color: "text-orange-600 bg-orange-100" 
    },
    { title: "Active Recipients", value: data.members.toString(), sub: "Registered wallets", icon: Users, color: "text-blue-600 bg-blue-100" },
    { 
      title: "Wallet Balance", 
      value: data.balance !== null ? `${data.balance.toLocaleString()} STX` : "----", 
      usdValue: data.usdBalance !== null ? `$${data.usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
      sub: "Available funds", 
      icon: Wallet, 
      color: "text-purple-600 bg-purple-100" 
    },
    { title: "Status", value: data.status, sub: "Business Role", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
  ];

  return (
    <>
      {stats.map((stat, i) => (
        <Card key={i} className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {stat.sub}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              {stat.usdValue && (
                <p className="text-xs font-bold text-muted-foreground mt-0.5">{stat.usdValue}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

// Sub-component for Recent Transactions
export function RecentTransactionsList({ address }: { address: string }) {
  const { getRecentTransactions, isTestnet } = useStacks();
  const [txs, setTxs] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 3;

  React.useEffect(() => {
    const fetch = async () => {
      if (!address) return;
      const data = await getRecentTransactions(address);
      setTxs(data || []);
    };
    fetch();
  }, [address, getRecentTransactions]);

  const currentTxs = txs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(txs.length / itemsPerPage);

  return (
    <Card className="lg:col-span-2 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <CardDescription>Latest STX payroll activities</CardDescription>
        </div>
        <Link href="/dashboard/history">
          <Button variant="ghost" size="sm" className="text-xs">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground font-medium">
                <th className="pb-3 text-left">Recipient/Type</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-left">Amount</th>
                <th className="pb-3 text-right">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentTxs.length > 0 ? currentTxs.map((tx, i) => (
                <tr key={i} className="hover:bg-accent/30 transition-colors">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{tx.tx_type === 'smart_contract' ? (tx.contract_call?.function_name || 'Call') : 'Transfer'}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{tx.sender_address === address ? 'Sent' : 'Received'}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      tx.tx_status === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {tx.tx_status}
                    </span>
                  </td>
                   <td className="py-4 font-mono font-bold text-primary">
                    {(() => {
                      const isSent = tx.sender_address === address;
                      const amount = isSent 
                        ? (tx.stx_sent || tx.token_transfer?.amount || 0) 
                        : (tx.stx_received || tx.token_transfer?.amount || 0);
                      return `${(Number(amount) / 1_000_000).toLocaleString()} STX`;
                    })()}
                  </td>
                  <td className="py-4 text-right">
                    <Link href={`https://explorer.stacks.co/txid/${tx.tx_id}?chain=${isTestnet ? 'testnet' : 'mainnet'}`} target="_blank">
                      <ExternalLink className="h-4 w-4 ml-auto text-primary" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground italic">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages || 1}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
