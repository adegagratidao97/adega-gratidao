'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  getClientTransactions,
  getClientBalance,
  registerPayment,
  chargeWallet,
} from '@/services/wallet.service'
import type { WalletTransaction } from '@/types/database'

export function useWallet(clientId: string | null) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    const [txRes, balRes] = await Promise.all([
      getClientTransactions(clientId),
      getClientBalance(clientId),
    ])
    setTransactions(txRes.data ?? [])
    setBalance(balRes.data ?? 0)
    setError(txRes.error ?? balRes.error)
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  return { transactions, balance, loading, error, refresh: load }
}

export function useWalletMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = async (
    clientId: string,
    amount: number,
    description?: string
  ): Promise<WalletTransaction | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await registerPayment(clientId, amount, description)
    setError(err)
    setLoading(false)
    return data
  }

  const charge = async (
    clientId: string,
    orderId: string | null,
    amount: number,
    description?: string
  ): Promise<WalletTransaction | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await chargeWallet(clientId, orderId, amount, description)
    setError(err)
    setLoading(false)
    return data
  }

  return { pay, charge, loading, error }
}
