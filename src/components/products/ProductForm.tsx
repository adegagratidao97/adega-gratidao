'use client'
import { useState, useEffect } from 'react'
import { useProductMutations } from '@/hooks/useProducts'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertBanner } from '@/components/shared/AlertBanner'
import type { Product } from '@/types/database'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSuccess?: () => void
}

interface FormState {
  name: string
  price: string
  category: string
  notes: string
  available: boolean
}

const emptyForm: FormState = {
  name: '',
  price: '',
  category: '',
  notes: '',
  available: true,
}

const CATEGORIAS = ['Cerveja', 'Vinho', 'Espumante', 'Destilado', 'Bebida', 'Snack', 'Outro']

export function ProductForm({ open, onOpenChange, product, onSuccess }: Props) {
  const { create, update, loading, error } = useProductMutations()
  const isEdit = !!product

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: String(product.price),
        category: product.category ?? '',
        notes: product.notes ?? '',
        available: product.available,
      })
    } else {
      setForm(emptyForm)
    }
  }, [product, open])

  function set(field: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const preco = parseFloat(form.price.replace(',', '.'))
    if (isNaN(preco) || preco < 0) return

    const input = {
      name: form.name.trim(),
      price: preco,
      active: true,
      category: form.category.trim() || undefined,
      notes: form.notes.trim() || undefined,
      available: form.available,
    }

    const result = isEdit
      ? await update(product!.id, input)
      : await create(input)

    if (result) {
      onSuccess?.()
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Produto' : 'Novo Produto'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-2">
          {error && <AlertBanner variant="error" message={error} />}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nome *
            </label>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex: Cerveja Heineken 600ml"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Preço *
            </label>
            <Input
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Categoria
            </label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="flex h-8 w-full rounded-lg border border-border bg-white px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">Sem categoria</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Observações
            </label>
            <Input
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Detalhes adicionais..."
            />
          </div>

          {/* Disponibilidade */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Disponível para venda</p>
              <p className="text-xs text-muted-foreground">
                Aparece no cardápio ao abrir comanda
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('available', !form.available)}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${
                form.available ? 'bg-green-500' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.available ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={loading || !form.name.trim() || !form.price}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Produto'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
