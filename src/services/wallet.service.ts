import { USE_MOCK } from '@/lib/db'
import { mockWallet } from '@/lib/mock/wallet.mock'
import { mockClients } from '@/lib/mock/clients.mock'
import type { WalletTransaction } from '@/types/database'
import type { ServiceResponse } from '@/types/app'

export async function getClientTransactions(
  clientId: string
): Promise<ServiceResponse<WalletTransaction[]>> {
  if (USE_MOCK) {
    return { data: mockWallet.findByClient(clientId), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getClientBalance(clientId: string): Promise<ServiceResponse<number>> {
  if (USE_MOCK) {
    const client = mockClients.findById(clientId)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    return { data: client.wallet_balance, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function registerPayment(
  clientId: string,
  amount: number,
  description?: string
): Promise<ServiceResponse<WalletTransaction>> {
  if (USE_MOCK) {
    const client = mockClients.findById(clientId)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    if (!client.wallet_enabled) return { data: null, error: 'Cliente não possui carteira habilitada.' }
    if (amount <= 0) return { data: null, error: 'Valor deve ser maior que zero.' }
    if (amount > client.wallet_balance) {
      return { data: null, error: 'Valor maior que o saldo devedor.' }
    }
    const tx = mockWallet.addPayment(clientId, amount, description)
    mockClients.updateBalance(clientId, client.wallet_balance - amount)
    return { data: tx, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function chargeWallet(
  clientId: string,
  orderId: string | null,
  amount: number,
  description?: string
): Promise<ServiceResponse<WalletTransaction>> {
  if (USE_MOCK) {
    const client = mockClients.findById(clientId)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    if (!client.wallet_enabled) return { data: null, error: 'Cliente não possui carteira habilitada.' }
    const tx = mockWallet.addCharge(clientId, orderId, amount, description)
    mockClients.updateBalance(clientId, client.wallet_balance + amount)
    return { data: tx, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}
