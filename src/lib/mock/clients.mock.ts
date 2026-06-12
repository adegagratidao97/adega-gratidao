import type { Client } from '@/types/database'

let _seq = 0
const uid = (prefix: string) => `${prefix}${Date.now()}_${++_seq}`

const store: Client[] = [
  {
    id: 'c1',
    name: 'João Silva',
    phone: '11999990001',
    wallet_enabled: true,
    wallet_limit: 300,
    wallet_balance: 450,
    notes: null,
    active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Maria Santos',
    phone: '11999990002',
    wallet_enabled: true,
    wallet_limit: 300,
    wallet_balance: 120,
    notes: null,
    active: true,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-06-05T10:00:00Z',
  },
  {
    id: 'c3',
    name: 'Pedro Oliveira',
    phone: '11999990003',
    wallet_enabled: false,
    wallet_limit: 300,
    wallet_balance: 0,
    notes: 'Cliente antigo',
    active: true,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'c4',
    name: 'Ana Costa',
    phone: null,
    wallet_enabled: true,
    wallet_limit: 300,
    wallet_balance: 0,
    notes: null,
    active: true,
    created_at: '2026-04-10T10:00:00Z',
    updated_at: '2026-04-10T10:00:00Z',
  },
  {
    id: 'c5',
    name: 'Carlos Ferreira',
    phone: '11999990005',
    wallet_enabled: true,
    wallet_limit: 300,
    wallet_balance: 300,
    notes: null,
    active: true,
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-06-08T10:00:00Z',
  },
]

export const mockClients = {
  findAll(search?: string): Client[] {
    if (!search) return store.filter(c => c.active)
    const q = search.toLowerCase()
    return store.filter(
      c => c.active && (c.name.toLowerCase().includes(q) || c.phone?.includes(q))
    )
  },

  findById(id: string): Client | undefined {
    return store.find(c => c.id === id)
  },

  create(input: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client {
    const now = new Date().toISOString()
    const client: Client = {
      ...input,
      id: uid('c'),
      created_at: now,
      updated_at: now,
    }
    store.push(client)
    return client
  },

  update(id: string, input: Partial<Client>): Client | undefined {
    const idx = store.findIndex(c => c.id === id)
    if (idx === -1) return undefined
    store[idx] = { ...store[idx], ...input, updated_at: new Date().toISOString() }
    return store[idx]
  },

  updateBalance(id: string, newBalance: number): Client | undefined {
    return mockClients.update(id, { wallet_balance: newBalance })
  },

  getTotalCarteira(): number {
    return store
      .filter(c => c.wallet_enabled && c.active)
      .reduce((s, c) => s + c.wallet_balance, 0)
  },
}
