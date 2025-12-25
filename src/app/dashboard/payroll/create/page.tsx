'use client'

import dynamic from 'next/dynamic'

const CreatePayrollClient = dynamic(
  () => import('./CreatePayrollClient'),
  { ssr: false }
)

export default function CreatePayrollPage() {
  return <CreatePayrollClient />
}
