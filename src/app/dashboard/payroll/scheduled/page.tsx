'use client'

import dynamic from 'next/dynamic'

const ScheduledPayrollClient = dynamic(
  () => import('./ScheduledPayrollClient'),
  { ssr: false }
)

export default function ScheduledPayrollPage() {
  return <ScheduledPayrollClient />
}
