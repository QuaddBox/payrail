import { getTeamMembers } from "@/app/actions/team"
import { PayrollClient } from "@/components/dashboard/PayrollClient"

export default async function PayrollPage() {
  const { data: members } = await getTeamMembers()

  return <PayrollClient initialRecipients={members || []} />
}
