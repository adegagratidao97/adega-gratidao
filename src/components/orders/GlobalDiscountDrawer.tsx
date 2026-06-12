'use client'
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatarMoeda } from '@/lib/utils/formatters'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDiscount: number
  currentSurcharge: number
  subtotal: number
  onApply: (discount: number, surcharge: number) => void
}

export function GlobalDiscountDrawer({
  open,
  onOpenChange,
  currentDiscount,
  currentSurcharge,
  subtotal,
  onApply,
}: Props) {
  const [desconto, setDesconto] = useState('')
  const [acrescimo, setAcrescimo] = useState('')

  useEffect(() => {
    if (open) {
      setDesconto(currentDiscount > 0 ? String(currentDiscount) : '')
      setAcrescimo(currentSurcharge > 0 ? String(currentSurcharge) : '')
    }
  }, [open, currentDiscount, currentSurcharge])

  const desc = parseFloat(desconto.replace(',', '.') || '0') || 0
  const acr = parseFloat(acrescimo.replace(',', '.') || '0') || 0
  const total = Math.max(0, subtotal - desc + acr)

  function handleApply() {
    onApply(desc, acr)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Desconto / Acréscimo</SheetTitle>
        </SheetHeader>
        <div className="px-4 py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Desconto (R$)
            </label>
            <Input
              type="number"
              value={desconto}
              onChange={e => setDesconto(e.target.value)}
              placeholder="0,00"
              min="0"
              max={subtotal}
              step="0.50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Acréscimo (R$)
            </label>
            <Input
              type="number"
              value={acrescimo}
              onChange={e => setAcrescimo(e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.50"
            />
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border">
            <span className="text-sm font-medium">Novo total</span>
            <span className="text-base font-bold text-brand-gold tabular-nums">
              {formatarMoeda(total)}
            </span>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="gold" onClick={handleApply}>
              Aplicar
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
