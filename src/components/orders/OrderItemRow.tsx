'use client'
import { Trash2 } from 'lucide-react'
import { QuantityStepper } from './QuantityStepper'
import { formatarMoeda } from '@/lib/utils/formatters'
import type { OrderItem } from '@/types/database'

interface Props {
  item: OrderItem
  editable?: boolean
  onQtyChange?: (itemId: string, qty: number) => void
  onRemove?: (itemId: string) => void
}

export function OrderItemRow({ item, editable, onQtyChange, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {item.product_name_snapshot}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {formatarMoeda(item.final_unit_price)} / un
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {editable ? (
          <QuantityStepper
            value={item.quantity}
            onChange={qty => onQtyChange?.(item.id, qty)}
          />
        ) : (
          <span className="text-sm text-muted-foreground tabular-nums w-8 text-center">
            {item.quantity}×
          </span>
        )}

        <span className="w-16 text-right text-sm font-semibold tabular-nums text-foreground">
          {formatarMoeda(item.line_total)}
        </span>

        {editable && (
          <button
            type="button"
            onClick={() => onRemove?.(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
            aria-label="Remover item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
