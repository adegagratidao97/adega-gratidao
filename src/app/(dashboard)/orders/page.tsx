'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'
import { OrderCard } from '@/components/orders/OrderCard'
import { buttonVariants } from '@/components/ui/button'
import { listOrders } from '@/services/orders.service'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/database'
import type { OrderStatus } from '@/types/app'

type Filtro = 'todas' | OrderStatus

const filtros: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'aberta', label: 'Abertas' },
  { value: 'paga', label: 'Pagas' },
  { value: 'fiado', label: 'Fiado' },
  { value: 'cancelada', label: 'Canceladas' },
]

export default function ComandasPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await listOrders(filtro === 'todas' ? undefined : { status: filtro })
    setOrders(data ?? [])
    setLoading(false)
  }, [filtro])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Comandas</h1>
        <Link
          href="/orders/new"
          className={cn(buttonVariants({ variant: 'gold', size: 'sm' }), 'gap-2')}
        >
          <Plus className="w-4 h-4" />
          Nova
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtros.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
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
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-border">
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">
            {filtro === 'todas' ? 'Nenhuma comanda registrada' : 'Nenhuma comanda neste filtro'}
          </p>
          {filtro === 'todas' && (
            <Link
              href="/orders/new"
              className={cn(buttonVariants({ variant: 'gold', size: 'sm' }), 'mt-4 gap-2')}
            >
              <Plus className="w-4 h-4" />
              Nova Comanda
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
