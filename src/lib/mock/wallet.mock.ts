import type { WalletTransaction } from '@/types/database'

let _seq = 0
const uid = () => `w${Date.now()}_${++_seq}`

const now = Date.now()
const d = (days: number) => new Date(now - days * 86_400_000).toISOString()

const store: WalletTransaction[] = [
  { id: 'w1', client_id: 'c1', order_id: 'o5', type: 'charge', amount: 120.00, description: 'Comanda #1002', created_at: d(2) },
  { id: 'w2', client_id: 'c1', order_id: null, type: 'charge', amount: 200.00, description: 'Comanda #998', created_at: d(5) },
  { id: 'w3', client_id: 'c1', order_id: null, type: 'charge', amount: 180.00, description: 'Comanda #990', created_at: d(10) },
  { id: 'w4', client_id: 'c1', order_id: null, type: 'payment', amount: 50.00, description: 'Pagamento parcial', created_at: d(8) },
  { id: 'w5', client_id: 'c2', order_id: 'o5', type: 'charge', amount: 120.00, description: 'Comanda #1002', created_at: d(2) },
  { id: 'w6', client_id: 'c5', order_id: null, type: 'charge', amount: 300.00, description: 'Comanda #995', created_at: d(3) },
]

export const mockWallet = {
  findByClient(clientId: string): WalletTransaction[] {
    return store
      .filter(t => t.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  addCharge(clientId: string, orderId: string | null, amount: number, description?: string): WalletTransaction {
    const tx: WalletTransaction = {
      id: uid(),
      client_id: clientId,
      order_id: orderId,
      type: 'charge',
      amount,
      description: description ?? null,
      created_at: new Date().toISOString(),
    }
    store.push(tx)
    return tx
  },

  addPayment(clientId: string, amount: number, description?: string): WalletTransaction {
    const tx: WalletTransaction = {
      id: uid(),
      client_id: clientId,
      order_id: null,
      type: 'payment',
      amount,
      description: description ?? 'Pagamento registrado',
      created_at: new Date().toISOString(),
    }
    store.push(tx)
    return tx
  },
}
