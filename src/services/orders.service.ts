import { USE_MOCK } from '@/lib/db'
import { mockOrders } from '@/lib/mock/orders.mock'
import { mockClients } from '@/lib/mock/clients.mock'
import { mockWallet } from '@/lib/mock/wallet.mock'
import { calcularLineTotalItem } from '@/lib/utils/calculations'
import type { Order, OrderItem } from '@/types/database'
import type { ServiceResponse } from '@/types/app'
import type { CloseOrderInput } from '@/lib/validations'

export interface AddItemInput {
  order_id: string
  product_id: string | null
  product_name_snapshot: string
  unit_price_snapshot: number
  quantity: number
  discount_value?: number
  surcharge_value?: number
  final_unit_price: number
}

export interface UpdateItemInput {
  quantity?: number
  discount_value?: number
  surcharge_value?: number
  final_unit_price?: number
}

export interface ReportData {
  totalVendido: number
  totalFiado: number
  totalCancelado: number
  ticketMedio: number
  totalCarteira: number
  topProdutos: { name: string; total: number; quantidade: number }[]
  topClientes: { name: string; total: number }[]
}

async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

async function recalcularTotais(orderId: string): Promise<void> {
  const supabase = await getSupabase()

  const { data: items } = await supabase
    .from('order_items')
    .select('line_total')
    .eq('order_id', orderId)

  const { data: order } = await supabase
    .from('orders')
    .select('discount_total, surcharge_total')
    .eq('id', orderId)
    .single()

  if (!items || !order) return

  const subtotal = items.reduce((s: number, i: { line_total: number }) => s + i.line_total, 0)
  const total = Math.max(0, subtotal - (order.discount_total ?? 0) + (order.surcharge_total ?? 0))

  await supabase.from('orders').update({ subtotal, total }).eq('id', orderId)
}

export async function listOpenOrders(): Promise<ServiceResponse<Order[]>> {
  if (USE_MOCK) {
    return { data: mockOrders.findOpen(), error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .select('*, client:clients(*)')
    .eq('status', 'aberta')
    .order('opened_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Order[], error: null }
}

export async function listOrders(filters?: {
  status?: string
  clientId?: string
}): Promise<ServiceResponse<Order[]>> {
  if (USE_MOCK) {
    return { data: mockOrders.findAll(filters), error: null }
  }

  const supabase = await getSupabase()
  let query = supabase
    .from('orders')
    .select('*, client:clients(*)')
    .order('opened_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.clientId) query = query.eq('client_id', filters.clientId)

  const { data, error } = await query
  if (error) return { data: null, error: error.message }
  return { data: data as Order[], error: null }
}

export async function getOrder(id: string): Promise<ServiceResponse<Order>> {
  if (USE_MOCK) {
    const order = mockOrders.findById(id)
    if (!order) return { data: null, error: 'Comanda não encontrada' }
    return { data: order, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .select('*, client:clients(*)')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.code === 'PGRST116' ? 'Comanda não encontrada' : error.message }
  return { data: data as Order, error: null }
}

export async function getOrderItems(orderId: string): Promise<ServiceResponse<OrderItem[]>> {
  if (USE_MOCK) {
    return { data: mockOrders.findItems(orderId), error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data as OrderItem[], error: null }
}

export async function getOpenOrderByClient(clientId: string): Promise<ServiceResponse<Order | null>> {
  if (USE_MOCK) {
    const order = mockOrders.findOpenByClient(clientId) ?? null
    return { data: order, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .select('*, client:clients(*)')
    .eq('client_id', clientId)
    .eq('status', 'aberta')
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  return { data: data as Order | null, error: null }
}

export async function createOrder(clientId: string): Promise<ServiceResponse<Order>> {
  if (USE_MOCK) {
    const existing = mockOrders.findOpenByClient(clientId)
    if (existing) return { data: null, error: 'Este cliente já possui uma comanda em aberto.' }
    const order = mockOrders.create(clientId)
    return { data: order, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .insert({ client_id: clientId })
    .select('*, client:clients(*)')
    .single()

  if (error) {
    if (error.code === '23505') return { data: null, error: 'Este cliente já possui uma comanda em aberto.' }
    return { data: null, error: error.message }
  }
  return { data: data as Order, error: null }
}

export async function addOrderItem(input: AddItemInput): Promise<ServiceResponse<OrderItem>> {
  if (USE_MOCK) {
    const lineTotal = calcularLineTotalItem(input.quantity, input.final_unit_price)
    const item = mockOrders.addItem({
      order_id: input.order_id,
      product_id: input.product_id,
      product_name_snapshot: input.product_name_snapshot,
      unit_price_snapshot: input.unit_price_snapshot,
      quantity: input.quantity,
      discount_value: input.discount_value ?? 0,
      surcharge_value: input.surcharge_value ?? 0,
      final_unit_price: input.final_unit_price,
      line_total: lineTotal,
    })
    return { data: item, error: null }
  }

  const supabase = await getSupabase()
  const lineTotal = calcularLineTotalItem(input.quantity, input.final_unit_price)

  const { data, error } = await supabase
    .from('order_items')
    .insert({
      order_id: input.order_id,
      product_id: input.product_id,
      product_name_snapshot: input.product_name_snapshot,
      unit_price_snapshot: input.unit_price_snapshot,
      quantity: input.quantity,
      discount_value: input.discount_value ?? 0,
      surcharge_value: input.surcharge_value ?? 0,
      final_unit_price: input.final_unit_price,
      line_total: lineTotal,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  await recalcularTotais(input.order_id)

  return { data: data as OrderItem, error: null }
}

export async function updateOrderItem(
  itemId: string,
  input: UpdateItemInput
): Promise<ServiceResponse<OrderItem>> {
  if (USE_MOCK) {
    const updates: Partial<OrderItem> = { ...input }
    if (input.quantity !== undefined && input.final_unit_price !== undefined) {
      updates.line_total = calcularLineTotalItem(input.quantity, input.final_unit_price)
    }
    const item = mockOrders.updateItem(itemId, updates)
    if (!item) return { data: null, error: 'Item não encontrado' }
    return { data: item, error: null }
  }

  const supabase = await getSupabase()
  const updates: Record<string, unknown> = { ...input }
  if (input.quantity !== undefined && input.final_unit_price !== undefined) {
    updates.line_total = calcularLineTotalItem(input.quantity, input.final_unit_price)
  }

  const { data, error } = await supabase
    .from('order_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  await recalcularTotais(data.order_id)

  return { data: data as OrderItem, error: null }
}

export async function removeOrderItem(itemId: string): Promise<ServiceResponse<boolean>> {
  if (USE_MOCK) {
    const ok = mockOrders.removeItem(itemId)
    if (!ok) return { data: null, error: 'Item não encontrado' }
    return { data: true, error: null }
  }

  const supabase = await getSupabase()

  const { data: item, error: fetchError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('id', itemId)
    .single()

  if (fetchError) return { data: null, error: 'Item não encontrado' }

  const { error } = await supabase.from('order_items').delete().eq('id', itemId)
  if (error) return { data: null, error: error.message }

  await recalcularTotais(item.order_id)

  return { data: true, error: null }
}

export async function updateOrderDiscounts(
  orderId: string,
  discountTotal: number,
  surchargeTotal: number
): Promise<ServiceResponse<Order>> {
  if (USE_MOCK) {
    const order = mockOrders.update(orderId, { discount_total: discountTotal, surcharge_total: surchargeTotal })
    if (!order) return { data: null, error: 'Comanda não encontrada' }
    const updated = mockOrders.recalculateTotals(orderId)
    return { data: updated ?? order, error: null }
  }

  const supabase = await getSupabase()

  const { data: current, error: fetchError } = await supabase
    .from('orders')
    .select('subtotal')
    .eq('id', orderId)
    .single()

  if (fetchError) return { data: null, error: 'Comanda não encontrada' }

  const newTotal = Math.max(0, (current.subtotal ?? 0) - discountTotal + surchargeTotal)

  const { data, error } = await supabase
    .from('orders')
    .update({ discount_total: discountTotal, surcharge_total: surchargeTotal, total: newTotal })
    .eq('id', orderId)
    .select('*, client:clients(*)')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Order, error: null }
}

export async function closeOrder(
  orderId: string,
  input: CloseOrderInput
): Promise<ServiceResponse<Order>> {
  if (USE_MOCK) {
    const order = mockOrders.findById(orderId)
    if (!order) return { data: null, error: 'Comanda não encontrada' }

    const now = new Date().toISOString()

    if (input.status === 'fiado') {
      const client = mockClients.findById(order.client_id)
      if (!client?.wallet_enabled) {
        return { data: null, error: 'Cliente não possui carteira habilitada.' }
      }
      mockWallet.addCharge(order.client_id, orderId, order.total, `Comanda #${order.order_number}`)
      mockClients.updateBalance(order.client_id, client.wallet_balance + order.total)
    }

    const updated = mockOrders.update(orderId, {
      status: input.status,
      payment_type: input.payment_type ?? null,
      closed_at: input.status === 'cancelada' ? null : now,
      cancelled_at: input.status === 'cancelada' ? now : null,
    })

    return { data: updated ?? order, error: null }
  }

  const supabase = await getSupabase()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, client:clients(*)')
    .eq('id', orderId)
    .single()

  if (orderError) return { data: null, error: 'Comanda não encontrada' }

  if (input.status === 'fiado') {
    const client = order.client as { wallet_enabled: boolean; wallet_balance: number } | null
    if (!client?.wallet_enabled) {
      return { data: null, error: 'Cliente não possui carteira habilitada.' }
    }

    const { error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        client_id: order.client_id,
        order_id: orderId,
        type: 'charge',
        amount: order.total,
        description: `Comanda #${order.order_number}`,
      })

    if (walletError) return { data: null, error: walletError.message }

    await supabase
      .from('clients')
      .update({
        wallet_balance: (client.wallet_balance ?? 0) + order.total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.client_id)
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: input.status,
      payment_type: input.payment_type ?? null,
      closed_at: input.status === 'cancelada' ? null : now,
      cancelled_at: input.status === 'cancelada' ? now : null,
    })
    .eq('id', orderId)
    .select('*, client:clients(*)')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Order, error: null }
}

export async function getReportData(from: Date, to: Date): Promise<ServiceResponse<ReportData>> {
  if (USE_MOCK) {
    const { mockClients: mc } = await import('@/lib/mock/clients.mock')
    const base = mockOrders.getReportData(from, to)
    return { data: { ...base, totalCarteira: mc.getTotalCarteira() }, error: null }
  }

  const supabase = await getSupabase()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('closed_at', from.toISOString())
    .lte('closed_at', to.toISOString())
    .in('status', ['paga', 'fiado', 'cancelada'])

  if (error) return { data: null, error: error.message }

  type OrderRow = { status: string; total: number; client_id: string; order_number: number; order_items: { product_id: string | null; product_name_snapshot: string; line_total: number; quantity: number }[] }

  const pagas = (orders as OrderRow[]).filter(o => o.status === 'paga')
  const fiadas = (orders as OrderRow[]).filter(o => o.status === 'fiado')
  const canceladas = (orders as OrderRow[]).filter(o => o.status === 'cancelada')

  const totalVendido = pagas.reduce((s, o) => s + o.total, 0)
  const totalFiado = fiadas.reduce((s, o) => s + o.total, 0)
  const totalCancelado = canceladas.reduce((s, o) => s + o.total, 0)
  const ticketMedio = pagas.length > 0 ? totalVendido / pagas.length : 0

  // Top produtos
  const prodMap = new Map<string, { name: string; total: number; quantidade: number }>()
  for (const order of pagas) {
    for (const item of order.order_items ?? []) {
      const key = item.product_id ?? item.product_name_snapshot
      const entry = prodMap.get(key)
      if (entry) { entry.total += item.line_total; entry.quantidade += item.quantity }
      else prodMap.set(key, { name: item.product_name_snapshot, total: item.line_total, quantidade: item.quantity })
    }
  }
  const topProdutos = [...prodMap.values()].sort((a, b) => b.total - a.total).slice(0, 5)

  // Top clientes
  const { data: clientsData } = await supabase.from('clients').select('id, name')
  const clientsById = new Map((clientsData ?? []).map((c: { id: string; name: string }) => [c.id, c.name]))

  const clientMap = new Map<string, { name: string; total: number }>()
  for (const order of pagas) {
    const entry = clientMap.get(order.client_id)
    if (entry) entry.total += order.total
    else clientMap.set(order.client_id, { name: clientsById.get(order.client_id) ?? '—', total: order.total })
  }
  const topClientes = [...clientMap.values()].sort((a, b) => b.total - a.total).slice(0, 5)

  // Total carteira
  const { data: walletData } = await supabase
    .from('clients')
    .select('wallet_balance')
    .eq('wallet_enabled', true)

  const totalCarteira = (walletData ?? []).reduce((s: number, c: { wallet_balance: number }) => s + (c.wallet_balance ?? 0), 0)

  return { data: { totalVendido, totalFiado, totalCancelado, ticketMedio, totalCarteira, topProdutos, topClientes }, error: null }
}

export async function getDashboardStats() {
  if (USE_MOCK) {
    return { data: mockOrders.getTodayStats(), error: null }
  }

  const supabase = await getSupabase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [abertasRes, hojeRes] = await Promise.all([
    supabase.from('orders').select('id').eq('status', 'aberta'),
    supabase
      .from('orders')
      .select('status, total')
      .gte('closed_at', today.toISOString())
      .in('status', ['paga', 'fiado']),
  ])

  const totalVendido = (hojeRes.data ?? [])
    .filter((o: { status: string; total: number }) => o.status === 'paga')
    .reduce((s: number, o: { total: number }) => s + o.total, 0)

  const totalFiado = (hojeRes.data ?? [])
    .filter((o: { status: string; total: number }) => o.status === 'fiado')
    .reduce((s: number, o: { total: number }) => s + o.total, 0)

  return {
    data: {
      totalVendido,
      comandasAbertas: abertasRes.data?.length ?? 0,
      totalFiado,
    },
    error: null,
  }
}
