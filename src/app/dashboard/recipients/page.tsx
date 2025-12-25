import { getTeamMembers } from "@/app/actions/team"
import { RecipientsClient } from "@/components/dashboard/RecipientsClient"

export default async function RecipientsPage() {
  const { data: members } = await getTeamMembers()

  return <RecipientsClient initialRecipients={members || []} />
}
