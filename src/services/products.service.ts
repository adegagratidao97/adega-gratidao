import { USE_MOCK } from '@/lib/db'
import { mockProducts } from '@/lib/mock/products.mock'
import type { Product } from '@/types/database'
import type { ServiceResponse } from '@/types/app'
import type { ProductInput } from '@/lib/validations'

export async function listProducts(
  search?: string,
  onlyAvailable = false
): Promise<ServiceResponse<Product[]>> {
  if (USE_MOCK) {
    return { data: mockProducts.findAll(search, onlyAvailable), error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function getProduct(id: string): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.findById(id)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
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
  return { data: null, error: 'Supabase não configurado' }
}

export async function toggleAvailability(id: string): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.toggleAvailability(id)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}

export async function toggleActive(id: string): Promise<ServiceResponse<Product>> {
  if (USE_MOCK) {
    const product = mockProducts.toggleActive(id)
    if (!product) return { data: null, error: 'Produto não encontrado' }
    return { data: product, error: null }
  }
  return { data: null, error: 'Supabase não configurado' }
}
