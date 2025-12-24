'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, Building2, Bell, Shield, Loader2, AlertTriangle } from "lucide-react"
import { deleteAccount } from "@/app/actions/auth"
import { Modal } from "@/components/dashboard/ActionModals"
import { useNotification } from "@/components/NotificationProvider"
import { useRouter } from "next/navigation"

export default function ProfileSettingsPage() {
  const { user, role } = useAuth()
  const { showNotification } = useNotification()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()
      if (result?.error) {
        showNotification("error", "Deletion Failed", result.error)
        setIsDeleting(false)
      } else if (result?.success) {
        showNotification("success", "Account Deleted", "Your account has been permanently removed.")
        // Small delay to let the user see the notification before redirecting
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    } catch (err) {
      showNotification("error", "Connection Error", "An error occurred. Please try again.")
      setIsDeleting(false)
    } finally {
      setShowConfirmDelete(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your basic account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="fullname" placeholder="John Doe" className="pl-10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" placeholder={user?.email || "name@example.com"} disabled className="pl-10 rounded-xl" />
                  </div>
                </div>
              </div>
              {role === 'business' && (
                <div className="space-y-2">
                  <Label htmlFor="org">Organization Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="org" placeholder="Acme Corp" className="pl-10 rounded-xl" />
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Button className="rounded-xl px-8 shadow-lg shadow-primary/20">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive payroll alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {[
                 { title: "Email Notifications", desc: "Receive email alerts when payments are sent or received.", icon: Mail, checked: true },
                 { title: "Transfer Updates", desc: "Get real-time status updates for blockchain transactions.", icon: Bell, checked: true },
                 { title: "Security Alerts", desc: "Critical alerts about account security and wallet syncs.", icon: Shield, checked: true },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
                   <div className="flex gap-4">
                     <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground">
                       <item.icon className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="text-sm font-bold">{item.title}</p>
                       <p className="text-xs text-muted-foreground">{item.desc}</p>
                     </div>
                   </div>
                   <div className={cn(
                     "w-12 h-6 rounded-full p-1 transition-colors",
                     item.checked ? "bg-primary" : "bg-accent"
                   )}>
                     <div className={cn(
                       "h-4 w-4 rounded-full bg-white transition-transform",
                       item.checked ? "translate-x-6" : "translate-x-0"
                     )} />
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="font-bold capitalize text-primary">{role || 'User'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Account Status</span>
                <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Verification</span>
                <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Verified</span>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="ghost" 
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs py-6"
            onClick={() => setShowConfirmDelete(true)}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete Account
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={showConfirmDelete} 
        onClose={() => !isDeleting && setShowConfirmDelete(false)} 
        title="Delete your account?" 
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 animate-bounce">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              All your data, organization history, and pending payments will be <span className="text-red-500 font-bold">permanently deleted</span>.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-2xl text-base font-bold shadow-xl shadow-red-500/20"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wiping Account...
                </>
              ) : (
                "Yes, delete everything"
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-2xl text-sm font-medium"
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
