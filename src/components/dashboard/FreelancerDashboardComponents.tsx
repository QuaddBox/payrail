"use client";

import * as React from "react";
import { Wallet, ArrowDownLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Sub-component for Earnings Stats
export function FreelancerEarningsStats() {
  // In a real app, this would fetch from a hook or prop
  const stats = [
    { title: "Total Earnings", value: "14,250 STX", icon: Wallet, color: "text-green-600 bg-green-100" },
    { title: "Last Payment", value: "850 STX", icon: ArrowDownLeft, color: "text-blue-600 bg-blue-100" },
    { title: "Pending Clearance", value: "200 STX", icon: Clock, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <>
      {stats.map((stat, i) => (
        <Card key={i} className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-0.5 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

// Sub-component for Recent Earnings List
export function RecentEarningsList() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 2;

  const allEarnings = [
    { from: "Design Studio Inc.", ref: "UI/UX Freelance Oct", amount: "+850 STX", date: "Oct 24, 2025" },
    { from: "Tech Solutions LLC", ref: "API Integration", amount: "+2,100 STX", date: "Oct 15, 2025" },
    { from: "Acme Org", ref: "Consulting", amount: "+500 STX", date: "Oct 10, 2025" },
    { from: "Web Wizards", ref: "Frontend Support", amount: "+1,200 STX", date: "Oct 5, 2025" },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEarnings = allEarnings.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(allEarnings.length / itemsPerPage);

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Earnings</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs">Download CSV</Button>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">View All</Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground font-medium bg-accent/5">
                <th className="px-6 py-4 text-left">Sender</th>
                <th className="px-6 py-4 text-left">Reference</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentEarnings.map((income, i) => (
                <tr key={i} className="group hover:bg-accent/30 transition-colors">
                  <td className="py-4 px-6 font-semibold group-hover:text-primary transition-colors">{income.from}</td>
                  <td className="py-4 px-6 text-muted-foreground">{income.ref}</td>
                  <td className="py-4 px-6 font-bold text-green-600 font-mono tracking-tighter">{income.amount}</td>
                  <td className="py-4 px-6 text-right text-muted-foreground">{income.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t px-6 pb-4">
          <p className="text-xs text-muted-foreground truncate">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allEarnings.length)} of {allEarnings.length}
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
