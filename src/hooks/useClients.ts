'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  listClients,
  getClient,
  createClient,
  updateClient,
} from '@/services/clients.service'
import type { Client } from '@/types/database'
import type { ClientInput } from '@/lib/validations'

export function useClients(search?: string) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listClients(search)
    setClients(data ?? [])
    setError(err)
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  return { clients, loading, error, refresh: load }
}

export function useClient(id: string | null) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getClient(id).then(({ data, error: err }) => {
      setClient(data)
      setError(err)
      setLoading(false)
    })
  }, [id, tick])

  const refresh = useCallback(() => setTick(t => t + 1), [])

  return { client, loading, error, refresh }
}

export function useClientMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (input: ClientInput): Promise<Client | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await createClient(input)
    setError(err)
    setLoading(false)
    return data
  }

  const update = async (id: string, input: Partial<ClientInput>): Promise<Client | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await updateClient(id, input)
    setError(err)
    setLoading(false)
    return data
  }

  return { create, update, loading, error }
}
