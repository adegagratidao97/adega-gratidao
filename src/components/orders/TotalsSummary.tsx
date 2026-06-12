import { formatarMoeda } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  subtotal: number
  discountTotal?: number
  surchargeTotal?: number
  total: number
  actionLabel: string
  onAction: () => void
  disabled?: boolean
  className?: string
}

export function TotalsSummary({
  subtotal,
  discountTotal = 0,
  surchargeTotal = 0,
  total,
  actionLabel,
  onAction,
  disabled,
  className,
}: Props) {
  return (
    <div className={cn('bg-white border-t border-border px-4 py-3 space-y-1.5', className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatarMoeda(subtotal)}</span>
      </div>
      {discountTotal > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Desconto</span>
          <span className="tabular-nums">−{formatarMoeda(discountTotal)}</span>
        </div>
      )}
      {surchargeTotal > 0 && (
        <div className="flex justify-between text-sm text-red-600">
          <span>Acréscimo</span>
          <span className="tabular-nums">+{formatarMoeda(surchargeTotal)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
        <span>Total</span>
        <span className="tabular-nums text-brand-gold">{formatarMoeda(total)}</span>
      </div>
      <Button onClick={onAction} disabled={disabled} variant="gold" className="w-full mt-1">
        {actionLabel}
      </Button>
    </div>
  )
}
