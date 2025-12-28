import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendPaymentDueEmail } from '@/app/actions/notifications'

// Vercel Cron: runs daily at 8 AM UTC
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron] Checking for due payrolls...')

  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Get all schedules that are due today or overdue
    const { data: dueSchedules, error: scheduleError } = await supabase
      .from('payroll_schedules')
      .select(`
        id,
        name,
        next_run_at,
        status,
        user_id,
        payroll_schedule_items (
          id,
          amount,
          team_member_id,
          team_members (
            id,
            name,
            email
          )
        )
      `)
      .lte('next_run_at', today)
      .in('status', ['draft', 'ready'])

    if (scheduleError) {
      console.error('[Cron] Error fetching schedules:', scheduleError)
      return NextResponse.json({ error: scheduleError.message }, { status: 500 })
    }

    console.log(`[Cron] Found ${dueSchedules?.length || 0} due schedules`)

    let emailsSent = 0

    for (const schedule of dueSchedules || []) {
      // Get organization name
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_name')
        .eq('id', schedule.user_id)
        .single()

      const orgName = profile?.organization_name || 'Your Organization'

      // Send email to each recipient in the schedule
      for (const item of schedule.payroll_schedule_items || []) {
        const recipient = (item as any).team_members
        if (!recipient?.email) continue

        await sendPaymentDueEmail({
          name: recipient.name,
          email: recipient.email,
          scheduleName: schedule.name,
          amount: item.amount,
          organizationName: orgName,
        })
        
        emailsSent++
      }
    }

    console.log(`[Cron] Sent ${emailsSent} payment due emails`)

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      schedulesFound: dueSchedules?.length || 0,
      emailsSent,
    })
  } catch (error: any) {
    console.error('[Cron] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
