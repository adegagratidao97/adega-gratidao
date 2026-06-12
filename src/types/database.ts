import type { OrderStatus, WalletTransactionType, UserRole } from './app'

export interface Client {
  id: string
  name: string
  phone: string | null
  wallet_enabled: boolean
  wallet_limit: number
  wallet_balance: number
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  active: boolean
  available: boolean
  category: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: number
  client_id: string
  status: OrderStatus
  payment_type: string | null
  subtotal: number
  discount_total: number
  surcharge_total: number
  total: number
  opened_at: string
  closed_at: string | null
  cancelled_at: string | null
  created_by: string | null
  notes: string | null
  client?: Client
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name_snapshot: string
  unit_price_snapshot: number
  quantity: number
  discount_value: number
  surcharge_value: number
  final_unit_price: number
  line_total: number
  created_at: string
}

export interface WalletTransaction {
  id: string
  client_id: string
  order_id: string | null
  type: WalletTransactionType
  amount: number
  description: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}
