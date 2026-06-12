'use client'
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils/formatters'
import type { Product } from '@/types/database'

interface Props {
  product: Product
  onEdit: (product: Product) => void
  onToggleAvailable: (id: string) => void
}

export function ProductCard({ product, onEdit, onToggleAvailable }: Props) {
  return (
    <div className={`bg-white rounded-xl border p-4 space-y-3 transition-opacity ${!product.available ? 'opacity-60' : ''} border-border shadow-sm`}>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight">{product.name}</p>
          {product.category && (
            <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
          )}
        </div>
        <button
          onClick={() => onEdit(product)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Editar produto"
        >
          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Preço + toggle */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold tabular-nums text-foreground">
          {formatarMoeda(product.price)}
        </span>

        <button
          onClick={() => onToggleAvailable(product.id)}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          aria-label={product.available ? 'Marcar como indisponível' : 'Marcar como disponível'}
        >
          {product.available ? (
            <>
              <ToggleRight className="w-5 h-5 text-green-600" />
              <span className="text-green-700">Disponível</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Indisponível</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
