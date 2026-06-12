'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { listProducts } from '@/services/products.service'
import { formatarMoeda } from '@/lib/utils/formatters'
import type { Product } from '@/types/database'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: Product) => void
}

export function ProductPicker({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    const { data } = await listProducts(q || undefined, true)
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!open) { setSearch(''); return }
    load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => load(search), 200)
    return () => clearTimeout(timer)
  }, [search, open, load])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75vh] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle>Selecionar Produto</SheetTitle>
        </SheetHeader>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produto disponível..."
              className="pl-9 bg-muted/50"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {search
                ? `Nenhum produto para "${search}"`
                : 'Nenhum produto disponível'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelect(product)
                    onOpenChange(false)
                    setSearch('')
                  }}
                  className="bg-white rounded-xl border border-border p-3 text-left hover:border-brand-gold active:scale-95 transition-all"
                >
                  <p className="font-medium text-sm text-foreground leading-tight">
                    {product.name}
                  </p>
                  {product.category && (
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  )}
                  <p className="text-sm font-bold text-brand-gold mt-2 tabular-nums">
                    {formatarMoeda(product.price)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
