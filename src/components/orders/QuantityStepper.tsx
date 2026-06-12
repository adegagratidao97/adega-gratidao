'use client'
import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-40 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-40 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  )
}
