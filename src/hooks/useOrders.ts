'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  listOpenOrders,
  listOrders,
  getOrder,
  getOrderItems,
  createOrder,
  addOrderItem,
  updateOrderItem,
  removeOrderItem,
  updateOrderDiscounts,
  closeOrder,
  getDashboardStats,
  getOpenOrderByClient,
} from '@/services/orders.service'
import type { AddItemInput, UpdateItemInput } from '@/services/orders.service'
import type { Order, OrderItem } from '@/types/database'
import type { CloseOrderInput } from '@/lib/validations'

export function useOpenOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listOpenOrders()
    setOrders(data ?? [])
    setError(err)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { orders, loading, error, refresh: load }
}

export function useOrders(filters?: { status?: string; clientId?: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listOrders(filters)
    setOrders(data ?? [])
    setError(err)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.clientId])

  useEffect(() => { load() }, [load])

  return { orders, loading, error, refresh: load }
}

export function useOrder(id: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [orderRes, itemsRes] = await Promise.all([getOrder(id), getOrderItems(id)])
    setOrder(orderRes.data)
    setItems(itemsRes.data ?? [])
    setError(orderRes.error ?? itemsRes.error)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  return { order, items, loading, error, refresh: load }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<{
    totalVendido: number
    comandasAbertas: number
    totalFiado: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(({ data }) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  return { stats, loading }
}

export function useOrderMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (clientId: string): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await createOrder(clientId)
    setError(err)
    setLoading(false)
    return data
  }

  const getOpenByClient = async (clientId: string): Promise<Order | null> => {
    const { data } = await getOpenOrderByClient(clientId)
    return data ?? null
  }

  const addItem = async (input: AddItemInput): Promise<OrderItem | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await addOrderItem(input)
    setError(err)
    setLoading(false)
    return data
  }

  const updateItem = async (itemId: string, input: UpdateItemInput): Promise<OrderItem | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await updateOrderItem(itemId, input)
    setError(err)
    setLoading(false)
    return data
  }

  const removeItem = async (itemId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await removeOrderItem(itemId)
    setError(err)
    setLoading(false)
    return data ?? false
  }

  const updateDiscounts = async (
    orderId: string,
    discountTotal: number,
    surchargeTotal: number
  ): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await updateOrderDiscounts(orderId, discountTotal, surchargeTotal)
    setError(err)
    setLoading(false)
    return data
  }

  const close = async (orderId: string, input: CloseOrderInput): Promise<Order | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await closeOrder(orderId, input)
    setError(err)
    setLoading(false)
    return data
  }

  return {
    create,
    getOpenByClient,
    addItem,
    updateItem,
    removeItem,
    updateDiscounts,
    close,
    loading,
    error,
  }
}
