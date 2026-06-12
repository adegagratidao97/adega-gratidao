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

export async function listOpenOrders(): Promise<ServiceResponse<Order[]>> {
  if (USE_MOCK) {
    return { data: mockOrders.findOpen(), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function listOrders(filters?: {
  status?: string
  clientId?: string
}): Promise<ServiceResponse<Order[]>> {
  if (USE_MOCK) {
    return { data: mockOrders.findAll(filters), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getOrder(id: string): Promise<ServiceResponse<Order>> {
  if (USE_MOCK) {
    const order = mockOrders.findById(id)
    if (!order) return { data: null, error: 'Comanda não encontrada' }
    return { data: order, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getOrderItems(orderId: string): Promise<ServiceResponse<OrderItem[]>> {
  if (USE_MOCK) {
    return { data: mockOrders.findItems(orderId), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getOpenOrderByClient(clientId: string): Promise<ServiceResponse<Order | null>> {
  if (USE_MOCK) {
    const order = mockOrders.findOpenByClient(clientId) ?? null
    return { data: order, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function createOrder(clientId: string): Promise<ServiceResponse<Order>> {
  if (USE_MOCK) {
    const existing = mockOrders.findOpenByClient(clientId)
    if (existing) {
      return { data: null, error: 'Este cliente já possui uma comanda em aberto.' }
    }
    const order = mockOrders.create(clientId)
    return { data: order, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
}

export async function updateOrderItem(
  itemId: string,
  input: UpdateItemInput
): Promise<ServiceResponse<OrderItem>> {
  if (USE_MOCK) {
    const updates: Partial<OrderItem> = { ...input }
    // Recalcula line_total quando quantidade e preço final estão disponíveis
    if (input.quantity !== undefined && input.final_unit_price !== undefined) {
      updates.line_total = calcularLineTotalItem(input.quantity, input.final_unit_price)
    }
    const item = mockOrders.updateItem(itemId, updates)
    if (!item) return { data: null, error: 'Item não encontrado' }
    return { data: item, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function removeOrderItem(itemId: string): Promise<ServiceResponse<boolean>> {
  if (USE_MOCK) {
    const ok = mockOrders.removeItem(itemId)
    if (!ok) return { data: null, error: 'Item não encontrado' }
    return { data: true, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
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

export async function getReportData(from: Date, to: Date): Promise<ServiceResponse<ReportData>> {
  if (USE_MOCK) {
    const { mockClients: mc } = await import('@/lib/mock/clients.mock')
    const base = mockOrders.getReportData(from, to)
    return {
      data: {
        ...base,
        totalCarteira: mc.getTotalCarteira(),
      },
      error: null,
    }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getDashboardStats() {
  if (USE_MOCK) {
    return { data: mockOrders.getTodayStats(), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}
