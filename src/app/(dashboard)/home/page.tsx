import Link from 'next/link'
import { Plus, TrendingUp, ClipboardList, Wallet } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { OrderCard } from '@/components/orders/OrderCard'
import { createClient } from '@/lib/supabase/server'
import { formatarMoeda } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersRes, fechadasHojeRes, abertasRes] = await Promise.all([
    supabase
      .from('orders')
      .select('*, client:clients(*)')
      .eq('status', 'aberta')
      .order('opened_at', { ascending: false }),
    supabase
      .from('orders')
      .select('status, total')
      .gte('closed_at', today.toISOString())
      .in('status', ['paga', 'fiado']),
    supabase
      .from('orders')
      .select('id')
      .eq('status', 'aberta'),
  ])

  const orders = (ordersRes.data ?? []) as Order[]
  const fechadasHoje = fechadasHojeRes.data ?? []

  const totalVendido = fechadasHoje
    .filter((o: { status: string; total: number }) => o.status === 'paga')
    .reduce((s: number, o: { total: number }) => s + o.total, 0)

  const totalFiado = fechadasHoje
    .filter((o: { status: string; total: number }) => o.status === 'fiado')
    .reduce((s: number, o: { total: number }) => s + o.total, 0)

  const comandasAbertas = abertasRes.data?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Adega Gratidão</p>
        </div>
        <Link
          href="/orders/new"
          className={cn(
            buttonVariants({ variant: 'gold', size: 'sm' }),
            'gap-2 shadow-sm'
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Comanda</span>
          <span className="sm:hidden">Nova</span>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 md:p-4 border border-border shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground font-medium leading-tight">
              Vendido Hoje
            </span>
          </div>
          <p className="text-base md:text-lg font-bold text-foreground tabular-nums leading-tight">
            {formatarMoeda(totalVendido)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 md:p-4 border border-border shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground font-medium leading-tight">
              Em Aberto
            </span>
          </div>
          <p className="text-base md:text-lg font-bold text-foreground tabular-nums leading-tight">
            {comandasAbertas}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 md:p-4 border border-border shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground font-medium leading-tight">
              Em Fiado
            </span>
          </div>
          <p className="text-base md:text-lg font-bold text-foreground tabular-nums leading-tight">
            {formatarMoeda(totalFiado)}
          </p>
        </div>
      </div>

      {/* Comandas em aberto */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Comandas em Aberto
          </h2>
          {orders.length > 0 && (
            <Link href="/orders" className="text-xs text-brand-gold font-medium hover:underline">
              Ver todas
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-border">
            <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">Nenhuma comanda aberta no momento</p>
            <Link
              href="/orders/new"
              className={cn(buttonVariants({ variant: 'gold', size: 'sm' }), 'mt-4 gap-2')}
            >
              <Plus className="w-4 h-4" />
              Abrir Primeira Comanda
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
