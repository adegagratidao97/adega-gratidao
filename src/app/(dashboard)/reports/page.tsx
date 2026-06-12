'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Wallet, Ban, Package, Users, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getReportData, type ReportData } from '@/services/orders.service'
import { formatarMoeda } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

type Periodo = 'hoje' | '7d' | 'mes' | 'custom'

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: 'mes', label: 'Este Mês' },
  { key: 'custom', label: 'Personalizado' },
]

function buildDates(
  periodo: Periodo,
  customFrom: string,
  customTo: string
): { from: Date; to: Date } | null {
  const now = new Date()
  if (periodo === 'hoje') {
    const from = new Date(now)
    from.setHours(0, 0, 0, 0)
    return { from, to: now }
  }
  if (periodo === '7d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 6)
    from.setHours(0, 0, 0, 0)
    return { from, to: now }
  }
  if (periodo === 'mes') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
  }
  if (customFrom && customTo) {
    return {
      from: new Date(customFrom + 'T00:00:00'),
      to: new Date(customTo + 'T23:59:59'),
    }
  }
  return null
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [appliedCustom, setAppliedCustom] = useState({ from: '', to: '' })
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData | null>(null)

  const load = useCallback(async () => {
    const dates = buildDates(periodo, appliedCustom.from, appliedCustom.to)
    if (!dates) return
    setLoading(true)
    const res = await getReportData(dates.from, dates.to)
    setData(res.data)
    setLoading(false)
  }, [periodo, appliedCustom])

  useEffect(() => {
    load()
  }, [load])

  function handlePeriodo(p: Periodo) {
    setPeriodo(p)
    if (p !== 'custom') setAppliedCustom({ from: '', to: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Resumo por período</p>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-2 flex-wrap">
        {PERIODOS.map(p => (
          <button
            key={p.key}
            onClick={() => handlePeriodo(p.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
              periodo === p.key
                ? 'bg-brand-gold text-black border-brand-gold'
                : 'bg-white text-muted-foreground border-border hover:border-brand-gold/50'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Seleção de datas customizadas */}
      {periodo === 'custom' && (
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">De</label>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground"
            />
          </div>
          <Button
            variant="gold"
            size="sm"
            disabled={!customFrom || !customTo}
            onClick={() => setAppliedCustom({ from: customFrom, to: customTo })}
          >
            Aplicar
          </Button>
        </div>
      )}

      {/* Skeleton */}
      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-20 rounded-xl bg-muted animate-pulse" />
          <div className="h-32 rounded-xl bg-muted animate-pulse" />
          <div className="h-32 rounded-xl bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              icon={<TrendingUp className="w-4 h-4 text-green-500" />}
              label="Total Vendido"
              value={formatarMoeda(data?.totalVendido ?? 0)}
              dark
            />
            <KpiCard
              icon={<Receipt className="w-4 h-4 text-blue-500" />}
              label="Ticket Médio"
              value={formatarMoeda(data?.ticketMedio ?? 0)}
            />
            <KpiCard
              icon={<Wallet className="w-4 h-4 text-amber-500" />}
              label="Em Fiado"
              value={formatarMoeda(data?.totalFiado ?? 0)}
            />
            <KpiCard
              icon={<Ban className="w-4 h-4 text-red-500" />}
              label="Cancelados"
              value={formatarMoeda(data?.totalCancelado ?? 0)}
            />
          </div>

          <KpiCard
            icon={<Wallet className="w-4 h-4 text-purple-500" />}
            label="Saldo total em carteira (todos os clientes)"
            value={formatarMoeda(data?.totalCarteira ?? 0)}
          />

          {/* Top produtos */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Top 5 Produtos
            </h2>
            {!data?.topProdutos.length ? (
              <EmptySection label="Nenhum produto vendido no período" />
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                {data.topProdutos.map((p, i) => (
                  <div
                    key={p.name}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3',
                      i !== 0 && 'border-t border-border'
                    )}
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 mr-2">{p.quantidade}×</span>
                    <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                      {formatarMoeda(p.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Top clientes */}
          <section className="space-y-2 pb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Top 5 Clientes
            </h2>
            {!data?.topClientes.length ? (
              <EmptySection label="Nenhum cliente encontrado no período" />
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                {data.topClientes.map((c, i) => (
                  <div
                    key={c.name}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3',
                      i !== 0 && 'border-t border-border'
                    )}
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{c.name}</span>
                    <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                      {formatarMoeda(c.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  dark,
}: {
  icon: React.ReactNode
  label: string
  value: string
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-3 md:p-4 border shadow-sm',
        dark ? 'bg-[#0F0F10] border-brand-gold/30' : 'bg-white border-border'
      )}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span
          className={cn(
            'text-[11px] font-medium leading-tight',
            dark ? 'text-white/60' : 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      </div>
      <p
        className={cn(
          'text-base md:text-lg font-bold tabular-nums leading-tight',
          dark ? 'text-brand-gold' : 'text-foreground'
        )}
      >
        {value}
      </p>
    </div>
  )
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
