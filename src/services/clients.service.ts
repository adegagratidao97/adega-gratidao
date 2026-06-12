import { USE_MOCK } from '@/lib/db'
import { mockClients } from '@/lib/mock/clients.mock'
import type { Client } from '@/types/database'
import type { ServiceResponse } from '@/types/app'
import type { ClientInput } from '@/lib/validations'

async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

export async function listClients(search?: string): Promise<ServiceResponse<Client[]>> {
  if (USE_MOCK) {
    return { data: mockClients.findAll(search), error: null }
  }

  const supabase = await getSupabase()
  let query = supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) return { data: null, error: error.message }
  return { data: data as Client[], error: null }
}

export async function getClient(id: string): Promise<ServiceResponse<Client>> {
  if (USE_MOCK) {
    const client = mockClients.findById(id)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    return { data: client, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.code === 'PGRST116' ? 'Cliente não encontrado' : error.message }
  return { data: data as Client, error: null }
}

export async function createClient(input: ClientInput): Promise<ServiceResponse<Client>> {
  if (USE_MOCK) {
    const client = mockClients.create({
      name: input.name,
      phone: input.phone ?? null,
      wallet_enabled: input.wallet_enabled ?? false,
      wallet_limit: input.wallet_limit ?? 300,
      wallet_balance: 0,
      notes: input.notes ?? null,
      active: true,
    })
    return { data: client, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      phone: input.phone ?? null,
      wallet_enabled: input.wallet_enabled ?? false,
      wallet_limit: input.wallet_limit ?? 300,
      wallet_balance: 0,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Client, error: null }
}

export async function updateClient(
  id: string,
  input: Partial<ClientInput>
): Promise<ServiceResponse<Client>> {
  if (USE_MOCK) {
    const client = mockClients.update(id, input)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    return { data: client, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('clients')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Client, error: null }
}
