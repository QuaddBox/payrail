'use server'

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('organization_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function addTeamMember(member: {
  name: string
  role?: string
  email?: string
  wallet_address: string
  btc_address?: string
  rate?: string
  payment_frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  type: 'employee' | 'contractor'
  contract_start?: string
  contract_end?: string
  contract_duration?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from('team_members')
    .insert([{
      ...member,
      organization_id: user.id,
      status: 'Active'
    }])

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/recipients')
  return { success: true }
}

export async function updateTeamMember(id: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/recipients')
  return { success: true }
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('organization_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/freelancers')
  return { success: true }
}
