import type { Order, OrderItem } from '@/types/database'
import { mockClients } from './clients.mock'

let _seq = 0
const uid = (prefix: string) => `${prefix}${Date.now()}_${++_seq}`

const now = Date.now()
const h = (hours: number) => new Date(now - hours * 3_600_000).toISOString()

const orderStore: Order[] = [
  {
    id: 'o1',
    order_number: 1003,
    client_id: 'c1',
    status: 'aberta',
    payment_type: null,
    subtotal: 60.00,
    discount_total: 0,
    surcharge_total: 0,
    total: 60.00,
    opened_at: h(1.5),
    closed_at: null,
    cancelled_at: null,
    created_by: null,
    notes: null,
  },
  {
    id: 'o2',
    order_number: 1004,
    client_id: 'c2',
    status: 'aberta',
    payment_type: null,
    subtotal: 38.00,
    discount_total: 0,
    surcharge_total: 0,
    total: 38.00,
    opened_at: h(0.5),
    closed_at: null,
    cancelled_at: null,
    created_by: null,
    notes: null,
  },
  {
    id: 'o3',
    order_number: 1005,
    client_id: 'c4',
    status: 'aberta',
    payment_type: null,
    subtotal: 103.00,
    discount_total: 10,
    surcharge_total: 0,
    total: 93.00,
    opened_at: h(3),
    closed_at: null,
    cancelled_at: null,
    created_by: null,
    notes: null,
  },
  {
    id: 'o4',
    order_number: 1001,
    client_id: 'c3',
    status: 'paga',
    payment_type: 'pix',
    subtotal: 45.00,
    discount_total: 0,
    surcharge_total: 0,
    total: 45.00,
    opened_at: h(26),
    closed_at: h(24),
    cancelled_at: null,
    created_by: null,
    notes: null,
  },
  {
    id: 'o5',
    order_number: 1002,
    client_id: 'c2',
    status: 'fiado',
    payment_type: null,
    subtotal: 120.00,
    discount_total: 0,
    surcharge_total: 0,
    total: 120.00,
    opened_at: h(50),
    closed_at: h(48),
    cancelled_at: null,
    created_by: null,
    notes: null,
  },
  {
    id: 'o6',
    order_number: 1000,
    client_id: 'c5',
    status: 'cancelada',
    payment_type: null,
    subtotal: 25.00,
    discount_total: 0,
    surcharge_total: 0,
    total: 25.00,
    opened_at: h(74),
    closed_at: null,
    cancelled_at: h(72),
    created_by: null,
    notes: 'Cliente desistiu',
  },
]

const itemStore: OrderItem[] = [
  { id: 'i1', order_id: 'o1', product_id: 'p1', product_name_snapshot: 'Cerveja Heineken 600ml', unit_price_snapshot: 12, quantity: 3, discount_value: 0, surcharge_value: 0, final_unit_price: 12, line_total: 36, created_at: h(1.5) },
  { id: 'i2', order_id: 'o1', product_id: 'p7', product_name_snapshot: 'Água Mineral 500ml', unit_price_snapshot: 4, quantity: 2, discount_value: 0, surcharge_value: 0, final_unit_price: 4, line_total: 8, created_at: h(1.5) },
  { id: 'i3', order_id: 'o1', product_id: 'p8', product_name_snapshot: 'Refrigerante 2L', unit_price_snapshot: 8, quantity: 2, discount_value: 0, surcharge_value: 0, final_unit_price: 8, line_total: 16, created_at: h(1.4) },
  { id: 'i4', order_id: 'o2', product_id: 'p4', product_name_snapshot: 'Vinho Branco Salton', unit_price_snapshot: 38, quantity: 1, discount_value: 0, surcharge_value: 0, final_unit_price: 38, line_total: 38, created_at: h(0.5) },
  { id: 'i5', order_id: 'o3', product_id: 'p5', product_name_snapshot: 'Espumante Chandon', unit_price_snapshot: 85, quantity: 1, discount_value: 0, surcharge_value: 0, final_unit_price: 85, line_total: 85, created_at: h(3) },
  { id: 'i6', order_id: 'o3', product_id: 'p7', product_name_snapshot: 'Água Mineral 500ml', unit_price_snapshot: 4, quantity: 2, discount_value: 0, surcharge_value: 0, final_unit_price: 4, line_total: 8, created_at: h(2.9) },
  { id: 'i7', order_id: 'o4', product_id: 'p3', product_name_snapshot: 'Vinho Tinto Santa Carolina', unit_price_snapshot: 45, quantity: 1, discount_value: 0, surcharge_value: 0, final_unit_price: 45, line_total: 45, created_at: h(26) },
  { id: 'i8', order_id: 'o5', product_id: 'p6', product_name_snapshot: 'Whisky Jack Daniels Dose', unit_price_snapshot: 25, quantity: 4, discount_value: 0, surcharge_value: 0, final_unit_price: 25, line_total: 100, created_at: h(50) },
  { id: 'i9', order_id: 'o5', product_id: 'p8', product_name_snapshot: 'Refrigerante 2L', unit_price_snapshot: 8, quantity: 2, discount_value: 4, surcharge_value: 0, final_unit_price: 4, line_total: 8, created_at: h(49.9) },
  { id: 'i10', order_id: 'o6', product_id: 'p6', product_name_snapshot: 'Whisky Jack Daniels Dose', unit_price_snapshot: 25, quantity: 1, discount_value: 0, surcharge_value: 0, final_unit_price: 25, line_total: 25, created_at: h(74) },
]

export const mockOrders = {
  findAll(filters?: { status?: string; clientId?: string }): Order[] {
    let result = [...orderStore]
    if (filters?.status) result = result.filter(o => o.status === filters.status)
    if (filters?.clientId) result = result.filter(o => o.client_id === filters.clientId)
    return result.map(o => ({
      ...o,
      client: mockClients.findById(o.client_id),
    }))
  },

  findOpen(): Order[] {
    return mockOrders.findAll({ status: 'aberta' })
  },

  findById(id: string): Order | undefined {
    const order = orderStore.find(o => o.id === id)
    if (!order) return undefined
    return { ...order, client: mockClients.findById(order.client_id) }
  },

  findOpenByClient(clientId: string): Order | undefined {
    return orderStore.find(o => o.client_id === clientId && o.status === 'aberta')
  },

  create(clientId: string): Order {
    const maxNum = orderStore.reduce((m, o) => Math.max(m, o.order_number), 1000)
    const order: Order = {
      id: uid('o'),
      order_number: maxNum + 1,
      client_id: clientId,
      status: 'aberta',
      payment_type: null,
      subtotal: 0,
      discount_total: 0,
      surcharge_total: 0,
      total: 0,
      opened_at: new Date().toISOString(),
      closed_at: null,
      cancelled_at: null,
      created_by: null,
      notes: null,
    }
    orderStore.push(order)
    return order
  },

  update(id: string, input: Partial<Order>): Order | undefined {
    const idx = orderStore.findIndex(o => o.id === id)
    if (idx === -1) return undefined
    orderStore[idx] = { ...orderStore[idx], ...input }
    return orderStore[idx]
  },

  recalculateTotals(id: string): Order | undefined {
    const items = mockOrders.findItems(id)
    const subtotal = items.reduce((s, i) => s + i.line_total, 0)
    const order = orderStore.find(o => o.id === id)
    if (!order) return undefined
    const total = Math.max(0, subtotal - order.discount_total + order.surcharge_total)
    return mockOrders.update(id, { subtotal, total })
  },

  findItems(orderId: string): OrderItem[] {
    return itemStore.filter(i => i.order_id === orderId)
  },

  addItem(item: Omit<OrderItem, 'id' | 'created_at'>): OrderItem {
    const newItem: OrderItem = {
      ...item,
      id: uid('i'),
      created_at: new Date().toISOString(),
    }
    itemStore.push(newItem)
    mockOrders.recalculateTotals(item.order_id)
    return newItem
  },

  updateItem(itemId: string, input: Partial<OrderItem>): OrderItem | undefined {
    const idx = itemStore.findIndex(i => i.id === itemId)
    if (idx === -1) return undefined
    itemStore[idx] = { ...itemStore[idx], ...input }
    mockOrders.recalculateTotals(itemStore[idx].order_id)
    return itemStore[idx]
  },

  removeItem(itemId: string): boolean {
    const item = itemStore.find(i => i.id === itemId)
    if (!item) return false
    const idx = itemStore.findIndex(i => i.id === itemId)
    itemStore.splice(idx, 1)
    mockOrders.recalculateTotals(item.order_id)
    return true
  },

  getReportData(from: Date, to: Date) {
    const inPeriod = orderStore.filter(o => {
      const ref = new Date(o.closed_at ?? o.opened_at)
      return ref >= from && ref <= to
    })

    const pagas = inPeriod.filter(o => o.status === 'paga')
    const fiadas = inPeriod.filter(o => o.status === 'fiado')
    const canceladas = inPeriod.filter(o => o.status === 'cancelada')

    const totalVendido = pagas.reduce((s, o) => s + o.total, 0)
    const totalFiado = fiadas.reduce((s, o) => s + o.total, 0)
    const totalCancelado = canceladas.reduce((s, o) => s + o.total, 0)
    const ticketMedio = pagas.length > 0 ? totalVendido / pagas.length : 0

    // Top produtos (comandas pagas no período)
    const prodMap = new Map<string, { name: string; total: number; quantidade: number }>()
    for (const order of pagas) {
      for (const item of itemStore.filter(i => i.order_id === order.id)) {
        const key = item.product_id ?? item.product_name_snapshot
        const entry = prodMap.get(key)
        if (entry) {
          entry.total += item.line_total
          entry.quantidade += item.quantity
        } else {
          prodMap.set(key, { name: item.product_name_snapshot, total: item.line_total, quantidade: item.quantity })
        }
      }
    }
    const topProdutos = [...prodMap.values()].sort((a, b) => b.total - a.total).slice(0, 5)

    // Top clientes (comandas pagas no período)
    const clientMap = new Map<string, { name: string; total: number }>()
    for (const order of pagas) {
      const client = mockClients.findById(order.client_id)
      const entry = clientMap.get(order.client_id)
      if (entry) {
        entry.total += order.total
      } else {
        clientMap.set(order.client_id, { name: client?.name ?? '—', total: order.total })
      }
    }
    const topClientes = [...clientMap.values()].sort((a, b) => b.total - a.total).slice(0, 5)

    return { totalVendido, totalFiado, totalCancelado, ticketMedio, topProdutos, topClientes }
  },

  getTodayStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = orderStore.filter(o => {
      const ref = o.closed_at ?? o.opened_at
      return new Date(ref) >= today
    })
    return {
      totalVendido: todayOrders
        .filter(o => o.status === 'paga')
        .reduce((s, o) => s + o.total, 0),
      comandasAbertas: orderStore.filter(o => o.status === 'aberta').length,
      totalFiado: todayOrders
        .filter(o => o.status === 'fiado')
        .reduce((s, o) => s + o.total, 0),
    }
  },
}
