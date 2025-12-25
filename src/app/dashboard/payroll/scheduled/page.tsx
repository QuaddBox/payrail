export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

import ScheduledPayrollClient from './ScheduledPayrollClient'

export default async function ScheduledPayrollPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('organization_id', user.id)
    .order('created_at', { ascending: false })

  return <ScheduledPayrollClient initialRecipients={members || []} />
}
