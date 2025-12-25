export type UserRole = 'business' | 'freelancer' | null

export interface Profile {
  id: string
  email: string
  role: UserRole
  wallet_address?: string
  full_name?: string
  organization_name?: string
  created_at: string
}

export interface Transaction {
  id: string
  amount: number
  tx_id: string
  status: 'pending' | 'success' | 'failed'
  to_address: string
  from_address: string
  created_at: string
  type: 'payroll' | 'transfer'
}

export interface Freelancer {
  id: string
  email: string
  wallet_address: string
  btc_address?: string
  name: string
  rate: number
}
