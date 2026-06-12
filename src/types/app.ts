export type OrderStatus = 'aberta' | 'paga' | 'fiado' | 'cancelada'

export type WalletTransactionType = 'charge' | 'payment' | 'reversal' | 'adjustment'

export type UserRole = 'admin' | 'atendente'

export type PaymentType = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix'

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}
