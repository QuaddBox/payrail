'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/hooks/useAuth'
import { StacksProvider } from '@/components/StacksProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StacksProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </StacksProvider>
    </ThemeProvider>
  )
}
