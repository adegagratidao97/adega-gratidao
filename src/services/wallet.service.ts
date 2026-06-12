import { USE_MOCK } from '@/lib/db'
import { mockWallet } from '@/lib/mock/wallet.mock'
import { mockClients } from '@/lib/mock/clients.mock'
import type { WalletTransaction } from '@/types/database'
import type { ServiceResponse } from '@/types/app'

async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

export async function getClientTransactions(
  clientId: string
): Promise<ServiceResponse<WalletTransaction[]>> {
  if (USE_MOCK) {
    return { data: mockWallet.findByClient(clientId), error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as WalletTransaction[], error: null }
}

export async function getClientBalance(clientId: string): Promise<ServiceResponse<number>> {
  if (USE_MOCK) {
    const client = mockClients.findById(clientId)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    return { data: client.wallet_balance, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('clients')
    .select('wallet_balance')
    .eq('id', clientId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data.wallet_balance, error: null }
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
    if (amount > client.wallet_balance) return { data: null, error: 'Valor maior que o saldo devedor.' }
    const tx = mockWallet.addPayment(clientId, amount, description)
    mockClients.updateBalance(clientId, client.wallet_balance - amount)
    return { data: tx, error: null }
  }

  const supabase = await getSupabase()

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('wallet_enabled, wallet_balance')
    .eq('id', clientId)
    .single()

  if (clientError) return { data: null, error: 'Cliente não encontrado' }
  if (!client.wallet_enabled) return { data: null, error: 'Cliente não possui carteira habilitada.' }
  if (amount <= 0) return { data: null, error: 'Valor deve ser maior que zero.' }
  if (amount > client.wallet_balance) return { data: null, error: 'Valor maior que o saldo devedor.' }

  const { data: tx, error: txError } = await supabase
    .from('wallet_transactions')
    .insert({
      client_id: clientId,
      order_id: null,
      type: 'payment',
      amount,
      description: description ?? 'Pagamento registrado',
    })
    .select()
    .single()

  if (txError) return { data: null, error: txError.message }

  await supabase
    .from('clients')
    .update({ wallet_balance: client.wallet_balance - amount, updated_at: new Date().toISOString() })
    .eq('id', clientId)

  return { data: tx as WalletTransaction, error: null }
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

  const supabase = await getSupabase()

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('wallet_enabled, wallet_balance')
    .eq('id', clientId)
    .single()

  if (clientError) return { data: null, error: 'Cliente não encontrado' }
  if (!client.wallet_enabled) return { data: null, error: 'Cliente não possui carteira habilitada.' }

  const { data: tx, error: txError } = await supabase
    .from('wallet_transactions')
    .insert({
      client_id: clientId,
      order_id: orderId,
      type: 'charge',
      amount,
      description: description ?? null,
    })
    .select()
    .single()

  if (txError) return { data: null, error: txError.message }

  await supabase
    .from('clients')
    .update({ wallet_balance: client.wallet_balance + amount, updated_at: new Date().toISOString() })
    .eq('id', clientId)

  return { data: tx as WalletTransaction, error: null }
}
