import { USE_MOCK } from '@/lib/db'
import { mockProducts } from '@/lib/mock/products.mock'
import type { Product } from '@/types/database'
import type { ServiceResponse } from '@/types/app'
import type { ProductInput } from '@/lib/validations'

async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

export async function listProducts(
  search?: string,
  onlyAvailable = false
): Promise<ServiceResponse<Product[]>> {
  if (USE_MOCK) {
    return { data: mockProducts.findAll(search, onlyAvailable), error: null }
  }

  const supabase = await getSupabase()
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (onlyAvailable) query = query.eq('available', true)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return { data: null, error: error.message }
  return { data: data as Product[], error: null }
}

export async function getProduct(id: string): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.findById(id)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.code === 'PGRST116' ? 'Produto não encontrado' : error.message }
  return { data: data as Product, error: null }
}

export async function createProduct(input: ProductInput): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.create({
      name: input.name,
      price: input.price,
      active: input.active ?? true,
      available: input.available ?? true,
      category: input.category ?? null,
      notes: input.notes ?? null,
    })
    return { data: product, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      price: input.price,
      active: input.active ?? true,
      available: input.available ?? true,
      category: input.category ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.update(id, input)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

export async function toggleAvailability(id: string): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.toggleAvailability(id)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }

  const supabase = await getSupabase()
  const { data: current, error: fetchError } = await supabase
    .from('products')
    .select('available')
    .eq('id', id)
    .single()

  if (fetchError) return { data: null, error: 'Produto não encontrado' }

  const { data, error } = await supabase
    .from('products')
    .update({ available: !current.available, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

export async function toggleActive(id: string): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.toggleActive(id)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }

  const supabase = await getSupabase()
  const { data: current, error: fetchError } = await supabase
    .from('products')
    .select('active')
    .eq('id', id)
    .single()

  if (fetchError) return { data: null, error: 'Produto não encontrado' }

  const { data, error } = await supabase
    .from('products')
    .update({ active: !current.active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}
