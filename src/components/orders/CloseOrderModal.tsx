'use client'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { closeOrder } from '@/services/orders.service'
import { verificarAlertaCarteira } from '@/lib/utils/wallet'
import { formatarMoeda } from '@/lib/utils/formatters'
import type { Order } from '@/types/database'
import type { PaymentType } from '@/types/app'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onSuccess: () => void
}

type CloseMode = 'paga' | 'fiado' | 'cancelada'

const formasPagamento: { value: PaymentType; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
]

export function CloseOrderModal({ open, onOpenChange, order, onSuccess }: Props) {
  const [modo, setModo] = useState<CloseMode>('paga')
  const [formaPagamento, setFormaPagamento] = useState<PaymentType>('dinheiro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = order.client
  const novoSaldo = (client?.wallet_balance ?? 0) + order.total
  const alertaFiado = verificarAlertaCarteira(novoSaldo)

  async function handleClose() {
    setLoading(true)
    setError(null)
    const { error: err } = await closeOrder(order.id, {
      status: modo,
      payment_type: modo === 'paga' ? formaPagamento : undefined,
    })
    if (err) { setError(err); setLoading(false); return }
    onOpenChange(false)
    onSuccess()
  }

  const modos: { value: CloseMode; label: string }[] = [
    { value: 'paga', label: 'Pago' },
    { value: 'fiado', label: 'Fiado' },
    { value: 'cancelada', label: 'Cancelar' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader>
          <SheetTitle>Fechar Comanda #{order.order_number}</SheetTitle>
        </SheetHeader>

        <div className="px-4 py-2 space-y-4">
          {error && <AlertBanner variant="error" message={error} />}

          {/* Seleção de modo */}
          <div className="grid grid-cols-3 gap-2">
            {modos.map(({ value, label }) => {
              const isActive = modo === value
              const isDisabled = value === 'fiado' && !client?.wallet_enabled
              return (
                <button
                  key={value}
                  onClick={() => !isDisabled && setModo(value)}
                  disabled={isDisabled}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${isActive
                      ? value === 'cancelada'
                        ? 'bg-red-500 text-white border-red-500'
                        : value === 'fiado'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-brand-gold text-brand-black border-brand-gold'
                      : 'bg-white border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Conteúdo por modo */}
          {modo === 'paga' && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Forma de Pagamento
              </p>
              <div className="grid grid-cols-2 gap-2">
                {formasPagamento.map(fp => (
                  <button
                    key={fp.value}
                    onClick={() => setFormaPagamento(fp.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${
                      formaPagamento === fp.value
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white border-border text-foreground hover:border-foreground/30'
                    }`}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {modo === 'fiado' && client?.wallet_enabled && (
            <div className="space-y-2">
              {alertaFiado && (
                <AlertBanner
                  variant="warning"
                  message={`Saldo após lançamento: ${formatarMoeda(novoSaldo)} — acima do limite de alerta.`}
                />
              )}
              <div className="bg-muted/50 rounded-xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo atual</span>
                  <span className="tabular-nums">{formatarMoeda(client.wallet_balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+ Esta comanda</span>
                  <span className="tabular-nums">{formatarMoeda(order.total)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-border pt-1">
                  <span>Novo saldo</span>
                  <span className={`tabular-nums ${alertaFiado ? 'text-amber-600' : ''}`}>
                    {formatarMoeda(novoSaldo)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {modo === 'cancelada' && (
            <AlertBanner
              variant="warning"
              message="A comanda será cancelada. Esta ação não pode ser desfeita."
            />
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total da comanda</span>
            <span className="text-lg font-bold tabular-nums">{formatarMoeda(order.total)}</span>
          </div>

          {/* Botão confirmar */}
          <button
            onClick={handleClose}
            disabled={loading || (modo === 'fiado' && !client?.wallet_enabled)}
            className={`w-full h-11 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${modo === 'cancelada'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : modo === 'fiado'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-brand-gold hover:bg-brand-gold-light text-brand-black'
              }`}
          >
            {loading
              ? 'Processando...'
              : modo === 'paga'
              ? `Confirmar Pagamento (${formatarMoeda(order.total)})`
              : modo === 'fiado'
              ? 'Lançar no Fiado'
              : 'Cancelar Comanda'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
