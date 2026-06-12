import type { Product } from '@/types/database'

let _seq = 0
const uid = (prefix: string) => `${prefix}${Date.now()}_${++_seq}`

const store: Product[] = [
  {
    id: 'p1',
    name: 'Cerveja Heineken 600ml',
    price: 12.00,
    active: true,
    available: true,
    category: 'Cerveja',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p2',
    name: 'Cerveja Brahma 600ml',
    price: 10.00,
    active: true,
    available: true,
    category: 'Cerveja',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p3',
    name: 'Vinho Tinto Santa Carolina',
    price: 45.00,
    active: true,
    available: true,
    category: 'Vinho',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p4',
    name: 'Vinho Branco Salton',
    price: 38.00,
    active: true,
    available: true,
    category: 'Vinho',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p5',
    name: 'Espumante Chandon',
    price: 85.00,
    active: true,
    available: true,
    category: 'Espumante',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p6',
    name: 'Whisky Jack Daniels Dose',
    price: 25.00,
    active: true,
    available: true,
    category: 'Destilado',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p7',
    name: 'Água Mineral 500ml',
    price: 4.00,
    active: true,
    available: true,
    category: 'Bebida',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p8',
    name: 'Refrigerante 2L',
    price: 8.00,
    active: true,
    available: true,
    category: 'Bebida',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p9',
    name: 'Dose Gin Tanqueray',
    price: 18.00,
    active: true,
    available: true,
    category: 'Destilado',
    notes: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'p10',
    name: 'Salgadinho Pringles',
    price: 15.00,
    active: true,
    available: false,
    category: 'Snack',
    notes: 'Aguardando reposição',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-06-09T10:00:00Z',
  },
]

export const mockProducts = {
  findAll(search?: string, onlyAvailable = false): Product[] {
    let result = store.filter(p => p.active)
    if (onlyAvailable) result = result.filter(p => p.available)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      )
    }
    return result
  },

  findById(id: string): Product | undefined {
    return store.find(p => p.id === id)
  },

  create(input: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const now = new Date().toISOString()
    const product: Product = {
      ...input,
      id: uid('p'),
      created_at: now,
      updated_at: now,
    }
    store.push(product)
    return product
  },

  update(id: string, input: Partial<Product>): Product | undefined {
    const idx = store.findIndex(p => p.id === id)
    if (idx === -1) return undefined
    store[idx] = { ...store[idx], ...input, updated_at: new Date().toISOString() }
    return store[idx]
  },

  toggleAvailability(id: string): Product | undefined {
    const product = store.find(p => p.id === id)
    if (!product) return undefined
    return mockProducts.update(id, { available: !product.available })
  },

  toggleActive(id: string): Product | undefined {
    const product = store.find(p => p.id === id)
    if (!product) return undefined
    return mockProducts.update(id, { active: !product.active })
  },
}
