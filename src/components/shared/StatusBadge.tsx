import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/app'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  aberta: { label: 'Aberta', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  paga: { label: 'Paga', className: 'bg-green-100 text-green-700 border-green-200' },
  fiado: { label: 'Fiado', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

interface Props {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
