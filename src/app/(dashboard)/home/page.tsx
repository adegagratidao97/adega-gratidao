import Link from 'next/link'
import { Plus, TrendingUp, ClipboardList, Wallet } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { OrderCard } from '@/components/orders/OrderCard'
import { listOpenOrders, getDashboardStats } from '@/services/orders.service'
import { formatarMoeda } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const [ordersRes, statsRes] = await Promise.all([
    listOpenOrders(),
    getDashboardStats(),
  ])

  const orders = ordersRes.data ?? []
  const stats = statsRes.data

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
            {formatarMoeda(stats?.totalVendido ?? 0)}
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
            {stats?.comandasAbertas ?? 0}
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
            {formatarMoeda(stats?.totalFiado ?? 0)}
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
