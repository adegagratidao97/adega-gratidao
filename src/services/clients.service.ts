import { USE_MOCK } from '@/lib/db'
import { mockClients } from '@/lib/mock/clients.mock'
import type { Client } from '@/types/database'
import type { ServiceResponse } from '@/types/app'
import type { ClientInput } from '@/lib/validations'

export async function listClients(search?: string): Promise<ServiceResponse<Client[]>> {
  if (USE_MOCK) {
    return { data: mockClients.findAll(search), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getClient(id: string): Promise<ServiceResponse<Client>> {
  if (USE_MOCK) {
    const client = mockClients.findById(id)
    if (!client) return { data: null, error: 'Cliente não encontrado' }
    return { data: client, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
}
