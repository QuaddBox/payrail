"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "info" | "loading"

interface Notification {
  id: string
  type: NotificationType
  message: string
  description?: string
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, description?: string) => void
  hideNotification: (id: string) => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  const showNotification = React.useCallback((type: NotificationType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { id, type, message, description }])

    if (type !== "loading") {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 5000)
    }
  }, [])

  const hideNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={cn(
                "pointer-events-auto w-full bg-card border rounded-2xl shadow-2xl p-4 flex gap-4 overflow-hidden relative group",
                n.type === "success" && "border-green-500/20 bg-green-500/5",
                n.type === "error" && "border-red-500/20 bg-red-500/5",
                n.type === "info" && "border-blue-500/20 bg-blue-500/5",
                n.type === "loading" && "border-primary/20 bg-primary/5"
              )}
            >
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                n.type === "success" && "bg-green-100 dark:bg-green-950/30 text-green-600",
                n.type === "error" && "bg-red-100 dark:bg-red-950/30 text-red-600",
                n.type === "info" && "bg-blue-100 dark:bg-blue-950/30 text-blue-600",
                n.type === "loading" && "bg-primary/10 text-primary"
              )}>
                {n.type === "success" && <CheckCircle2 className="h-5 w-5" />}
                {n.type === "error" && <AlertCircle className="h-5 w-5" />}
                {n.type === "info" && <Info className="h-5 w-5" />}
                {n.type === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>

              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-sm font-bold truncate leading-tight">{n.message}</p>
                {n.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {n.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => hideNotification(n.id)}
                className="h-6 w-6 shrink-0 rounded-lg hover:bg-accent flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>

              <div className={cn(
                "absolute bottom-0 left-0 h-1 bg-current opacity-20",
                n.type !== "loading" && "animate-progress"
              )} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = React.useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
