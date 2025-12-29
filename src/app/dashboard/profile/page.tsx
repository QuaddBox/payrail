import { createClient } from "@/lib/supabase-server"
import { ProfileClient } from "@/components/dashboard/ProfileClient"
import { redirect } from "next/navigation"

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email_notifications')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <ProfileClient 
      initialUser={user} 
      initialRole={profile?.role} 
      initialEmailNotifications={profile?.email_notifications ?? true}
    />
  )
}

