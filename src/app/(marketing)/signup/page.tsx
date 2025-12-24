'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet, Briefcase, User as UserIcon, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { createClient } from "@/lib/supabase"
import { signUp } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"
import { useNotification } from "@/components/NotificationProvider"

export default function SignupPage() {
  const [role, setRole] = React.useState<'business' | 'freelancer' | null>(null)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const { showNotification } = useNotification()
  const router = useRouter()
  const supabase = createClient()

  const handleBack = () => {
    if (role) setRole(null)
    else router.push('/')
  }

  return (
    <div className="min-h-[calc(100vh-64px-137px)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="self-start mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your Payrail account</h1>
          <p className="text-muted-foreground">Join the next generation of Bitcoin & STX payroll</p>
        </div>

        {!role ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:border-primary transition-all hover:bg-primary/5 group relative overflow-hidden"
              onClick={() => setRole('business')}
            >
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle>Business</CardTitle>
                  <CardDescription>
                    I want to pay freelancers and manage my organization's payroll in STX.
                  </CardDescription>
                </div>
              </CardHeader>
              <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="link" size="sm" className="p-0">Continue →</Button>
              </div>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-all hover:bg-primary/5 group relative overflow-hidden"
              onClick={() => setRole('freelancer')}
            >
               <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle>Freelancer</CardTitle>
                  <CardDescription>
                    I want to receive payments in STX and track my earning history.
                  </CardDescription>
                </div>
              </CardHeader>
              <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="link" size="sm" className="p-0">Continue →</Button>
              </div>
            </Card>
          </div>
        ) : isSuccess ? (
          <Card className="shadow-2xl border-none ring-1 ring-border animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Confirm your email</CardTitle>
              <CardDescription className="text-base">
                We've sent a confirmation link to <span className="font-bold text-foreground">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 text-center">
              <p className="text-muted-foreground">
                Please check your inbox (and spam folder) and click the link to activate your account.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                 <Link href="/login">
                  <Button variant="outline" className="w-full h-11 rounded-xl">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl border-none ring-1 ring-border">
            <CardHeader>
              <CardTitle className="capitalize text-xl">{role} Registration</CardTitle>
              <CardDescription>Enter your details below to create your {role} account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                setIsLoading(true)
                try {
                  const result = await signUp({ email, password, role })
                  if (result?.error) {
                    showNotification("error", "Signup Failed", result.error)
                    setIsLoading(false)
                  } else if (result?.success) {
                    setIsSuccess(true)
                    showNotification("success", "Verify Your Email", `We sent a link to ${email}`)
                  }
                } catch (err: any) {
                  showNotification("error", "Signup Error", "A connection error occurred. Please try again.")
                  setIsLoading(false)
                }
              }}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-11 px-4 bg-accent/20"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl h-11 px-4 bg-accent/20 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 rounded-xl text-base mt-4 shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  )
}
