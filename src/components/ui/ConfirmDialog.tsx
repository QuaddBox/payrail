'use client'

import * as React from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default',
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const iconColors = {
    danger: 'text-red-500',
    warning: 'text-amber-500',
    default: 'text-primary'
  }

  const buttonColors = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    default: 'bg-primary hover:bg-primary/90'
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

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full bg-accent ${iconColors[variant]}`}>
            {variant === 'danger' ? (
              <Trash2 className="h-8 w-8" />
            ) : (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl font-bold"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className={`flex-1 rounded-xl font-bold text-white ${buttonColors[variant]}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
