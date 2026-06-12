'use client'
import { useState, useCallback } from 'react'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductForm } from '@/components/products/ProductForm'
import { ClientSearch } from '@/components/clients/ClientSearch'
import { listProducts, toggleAvailability } from '@/services/products.service'
import type { Product } from '@/types/database'
import { useEffect } from 'react'

type Filtro = 'todos' | 'disponivel' | 'indisponivel'

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await listProducts(search || undefined, false)
    let lista = data ?? []
    if (filtro === 'disponivel') lista = lista.filter(p => p.available)
    if (filtro === 'indisponivel') lista = lista.filter(p => !p.available)
    setProducts(lista)
    setLoading(false)
  }, [search, filtro])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function handleToggle(id: string) {
    await toggleAvailability(id)
    load()
  }

  function handleEdit(product: Product) {
    setEditProduct(product)
    setFormOpen(true)
  }

  function handleNovo() {
    setEditProduct(undefined)
    setFormOpen(true)
  }

  const filtros: { value: Filtro; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'disponivel', label: 'Disponíveis' },
    { value: 'indisponivel', label: 'Indisponíveis' },
  ]

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Produtos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? '...' : `${products.length} produto${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button variant="gold" size="sm" className="gap-2" onClick={handleNovo}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Produto</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Busca */}
      <ClientSearch value={search} onChange={setSearch} placeholder="Buscar produto..." />

      {/* Filtros */}
      <div className="flex gap-2">
        {filtros.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtro === f.value
                ? 'bg-brand-black text-white'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-border">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          {search ? (
            <p className="text-sm text-muted-foreground">
              Nenhum produto encontrado para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Nenhum produto cadastrado</p>
              <Button variant="gold" size="sm" className="mt-4 gap-2" onClick={handleNovo}>
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Produto
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onToggleAvailable={handleToggle}
            />
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditProduct(undefined)
        }}
        product={editProduct}
        onSuccess={load}
      />
    </div>
  )
}
