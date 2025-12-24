'use client'

import { Sidebar } from "@/components/Sidebar"
import { Container } from "@/components/ui/container"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-accent/5">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ml-16 md:ml-64 p-4 md:p-8">
        <Container className="max-w-6xl">
          {children}
        </Container>
      </main>
    </div>
  )
}
