'use client'

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Zap, BarChart3, Wallet, PlusSquare, Send, Search, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  },
  viewport: { once: true }
}

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        <Container className="relative">
          <motion.div 
            className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Non-custodial Bitcoin & STX payments</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Payroll on the <span className="text-primary italic">Stacks</span> <br className="hidden md:block" /> Blockchain
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Pay freelancers in Bitcoin & STX with full transparency. No custody, no middlemen. You stay in control of your assets while we handle the rails.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Link href="/signup">
                <Button size="lg" className="px-10 h-14 text-base rounded-2xl group">
                  Start Paying in Crypto
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="px-10 h-14 text-base rounded-2xl">
                  See How It Works
                </Button>
              </Link>
            </div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 md:pt-20 text-muted-foreground"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Instant BTC & STX transfers</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Non-custodial wallets</span>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Real-time tracking</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-accent/5 scroll-mt-20">
        <Container>
          <motion.div 
            className="text-center space-y-4 mb-20"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold tracking-tight italic text-primary">How Payroll Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Simple, secure, and non-custodial. Pay your global team in Bitcoin and STX without ever losing control of your assets.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Wallet,
                title: "Connect Your Wallet",
                desc: "Link your Hiro or Leather wallet securely. We never store your private keys.",
                color: "bg-orange-100 text-orange-600"
              },
              {
                icon: PlusSquare,
                title: "Create Organization",
                desc: "Set up your business and add freelancer wallet addresses to your payroll.",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: Send,
                title: "Send STX Payments",
                desc: "Execute payroll payments directly from your wallet to freelancers.",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: Search,
                title: "Track Everything",
                desc: "Full transaction history with fiat value estimates for reporting.",
                color: "bg-purple-100 text-purple-600"
              }
            ].map((step, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Card className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                  <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                    <div className={cn("p-4 rounded-2xl", step.color)}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-24 scroll-mt-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold tracking-tight leading-tight">
                Powerful Rails for Your <span className="text-primary italic">Global Team</span>
              </h2>
              <div className="space-y-4">
                {[
                  "Non-custodial infrastructure - you own your keys",
                  "Direct wallet-to-wallet BTC & STX transfers",
                  "Support for Hiro, Leather, and Xverse wallets",
                  "Automated smart contract payroll templates",
                  "Immutable blockchain receipts for reporting"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold">Beyond basic transfers</h3>
                <p className="text-muted-foreground text-sm">
                  Payrail doesn't just send coins. We provide the enterprise-grade management layer for decentralized workforces, including batch processing, organizational hierarchies, and detailed tax-ready reporting.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="rounded-xl px-8 h-12 w-fit">Explore All Features</Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square bg-gradient-to-tr from-primary/20 to-primary/5 rounded-[3rem] -rotate-3 p-8 border border-primary/10">
                <div className="w-full h-full bg-card rounded-[2rem] shadow-2xl border flex flex-col p-6 space-y-6 overflow-hidden">
                  <div className="h-8 w-32 bg-accent rounded-full mb-4" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-xl bg-accent/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20" />
                        <div className="h-3 w-20 bg-accent rounded-full" />
                      </div>
                      <div className="h-3 w-12 bg-primary rounded-full" />
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent" />
                        <div className="h-3 w-16 bg-accent rounded-full" />
                      </div>
                      <div className="h-3 w-10 bg-accent rounded-full" />
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent" />
                        <div className="h-3 w-24 bg-accent rounded-full" />
                      </div>
                      <div className="h-3 w-14 bg-accent rounded-full" />
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t flex justify-between">
                     <div className="h-3 w-20 bg-accent rounded-full" />
                     <div className="h-3 w-12 bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24">
        <Container>
          <motion.div 
            className="relative bg-primary rounded-[3rem] p-12 md:p-20 overflow-hidden group"
            {...fadeInUp}
          >
             {/* Decorative circles */}
            <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 h-64 w-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:bg-black/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
                Ready to decentralize your payroll?
              </h2>
              <p className="text-primary-foreground/90 text-lg md:text-xl">
                Join the next generation of businesses using Payrail to pay freelancers in Bitcoin & STX. Fast, compliant, and non-custodial.
              </p>
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="rounded-2xl px-12 h-14 font-bold shadow-2xl hover:scale-105 transition-transform bg-white text-primary">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
