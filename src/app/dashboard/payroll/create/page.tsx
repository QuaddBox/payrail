import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import CreatePayrollClient from './CreatePayrollClient'

export default async function CreatePayrollPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return <CreatePayrollClient />
}
