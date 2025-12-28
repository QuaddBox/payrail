export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { PayrollPageClient } from "@/components/dashboard/PayrollPageClient"

export default async function PayrollPage() {
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

  return <PayrollPageClient initialRecipients={members || []} />
}
