'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleAvailability,
  toggleActive,
} from '@/services/products.service'
import type { Product } from '@/types/database'
import type { ProductInput } from '@/lib/validations'

export function useProducts(search?: string, onlyAvailable = false) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await listProducts(search, onlyAvailable)
    setProducts(data ?? [])
    setError(err)
    setLoading(false)
  }, [search, onlyAvailable])

  useEffect(() => { load() }, [load])

  return { products, loading, error, refresh: load }
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProduct(id).then(({ data, error: err }) => {
      setProduct(data)
      setError(err)
      setLoading(false)
    })
  }, [id])

  return { product, loading, error }
}

export function useProductMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (input: ProductInput): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await createProduct(input)
    setError(err)
    setLoading(false)
    return data
  }

  const update = async (id: string, input: Partial<ProductInput>): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await updateProduct(id, input)
    setError(err)
    setLoading(false)
    return data
  }

  const toggleAvail = async (id: string): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await toggleAvailability(id)
    setError(err)
    setLoading(false)
    return data
  }

  const toggleAct = async (id: string): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await toggleActive(id)
    setError(err)
    setLoading(false)
    return data
  }

  return { create, update, toggleAvailability: toggleAvail, toggleActive: toggleAct, loading, error }
}
