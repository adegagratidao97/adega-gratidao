import Link from 'next/link'
import { ChevronRight, User } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatarMoeda, calcularTempoAberto } from '@/lib/utils/formatters'
import type { Order } from '@/types/database'

interface Props {
  order: Order
}

export function OrderCard({ order }: Props) {
  return (
    <Link href={`/orders/${order.id}`} className="block group">
      <div className="bg-white rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm group-hover:shadow-md transition-shadow group-active:scale-[0.99] transition-transform">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-brand-gold" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground truncate text-sm">
              {order.client?.name ?? '—'}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-muted-foreground">#{order.order_number}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span suppressHydrationWarning className="text-xs text-muted-foreground">
              {calcularTempoAberto(order.opened_at)}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-semibold text-sm tabular-nums text-foreground">
            {formatarMoeda(order.total)}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}
