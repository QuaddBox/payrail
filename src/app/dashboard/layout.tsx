import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { Container } from "@/components/ui/container"
import { DashboardDataProvider } from "@/components/DashboardDataProvider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardDataProvider>
      <div className="flex min-h-screen bg-accent/5">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
          <Container className="max-w-6xl">
            {children}
          </Container>
        </main>
        <MobileNav />
      </div>
    </DashboardDataProvider>
  )
}

