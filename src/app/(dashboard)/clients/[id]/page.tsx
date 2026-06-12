'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Phone, Wallet, StickyNote, CreditCard } from 'lucide-react'
import { useClient } from '@/hooks/useClients'
import { useWallet, useWalletMutations } from '@/hooks/useWallet'
import { ClientForm } from '@/components/clients/ClientForm'
import { AlertBanner } from '@/components/shared/AlertBanner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatarMoeda, formatarData, formatarHora } from '@/lib/utils/formatters'
import { verificarAlertaCarteira } from '@/lib/utils/wallet'
import type { WalletTransactionType } from '@/types/app'

const tipoLabel: Record<WalletTransactionType, string> = {
  charge: 'Compra',
  payment: 'Pagamento',
  reversal: 'Estorno',
  adjustment: 'Ajuste',
}

export default function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { client, loading, refresh } = useClient(id)
  const { transactions, balance, refresh: refreshWallet } = useWallet(id)
  const { pay, loading: pagando, error: erroPagamento } = useWalletMutations()

  const [editOpen, setEditOpen] = useState(false)
  const [pagamentoOpen, setPagamentoOpen] = useState(false)
  const [valorPagamento, setValorPagamento] = useState('')

  const temAlerta = client?.wallet_enabled && verificarAlertaCarteira(balance)

  async function handlePagamento(e: React.FormEvent) {
    e.preventDefault()
    const valor = parseFloat(valorPagamento.replace(',', '.'))
    if (!valor || valor <= 0) return

    const resultado = await pay(id, valor, 'Pagamento registrado manualmente')
    if (resultado) {
      setValorPagamento('')
      setPagamentoOpen(false)
      refresh()
      refreshWallet()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{client.name}</h1>
          {!client.active && (
            <span className="text-xs text-red-500 font-medium">Inativo</span>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Button>
      </div>

      {/* Alerta de saldo */}
      {temAlerta && (
        <AlertBanner
          variant="warning"
          message={`Saldo em fiado de ${formatarMoeda(balance)} está acima do limite de alerta.`}
        />
      )}

      {/* Dados cadastrais */}
      <div className="bg-white rounded-xl border border-border divide-y divide-border">
        {client.phone && (
          <div className="flex items-center gap-3 px-4 py-3">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">{client.phone}</span>
          </div>
        )}
        {client.notes && (
          <div className="flex items-start gap-3 px-4 py-3">
            <StickyNote className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{client.notes}</span>
          </div>
        )}
        {!client.phone && !client.notes && (
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">Sem informações adicionais.</p>
          </div>
        )}
      </div>

      {/* Carteira */}
      {client.wallet_enabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Carteira (Fiado)
            </h2>
            {balance > 0 && (
              <Button
                variant="gold"
                size="sm"
                className="gap-1.5"
                onClick={() => setPagamentoOpen(true)}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Registrar Pagamento
              </Button>
            )}
          </div>

          {/* Saldo */}
          <div className={`rounded-xl border p-4 ${temAlerta ? 'bg-amber-50 border-amber-200' : 'bg-white border-border'}`}>
            <p className="text-xs text-muted-foreground mb-1">Saldo devedor</p>
            <p className={`text-2xl font-bold tabular-nums ${temAlerta ? 'text-amber-700' : 'text-foreground'}`}>
              {formatarMoeda(balance)}
            </p>
          </div>

          {/* Histórico */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Histórico de Transações
                </p>
              </div>
              <div className="divide-y divide-border">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{tipoLabel[tx.type]}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatarData(tx.created_at)} · {formatarHora(tx.created_at)}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        tx.type === 'payment' || tx.type === 'reversal'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'payment' || tx.type === 'reversal' ? '−' : '+'}
                      {formatarMoeda(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form de edição */}
      <ClientForm
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSuccess={() => refresh()}
      />

      {/* Sheet de pagamento */}
      <Sheet open={pagamentoOpen} onOpenChange={setPagamentoOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Registrar Pagamento</SheetTitle>
          </SheetHeader>
          <form onSubmit={handlePagamento} className="px-4 py-2 space-y-4">
            {erroPagamento && <AlertBanner variant="error" message={erroPagamento} />}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Valor (máx. {formatarMoeda(balance)})
              </label>
              <Input
                type="number"
                value={valorPagamento}
                onChange={e => setValorPagamento(e.target.value)}
                placeholder="0,00"
                min="0.01"
                max={balance}
                step="0.01"
                required
                autoFocus
              />
            </div>
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPagamentoOpen(false)}
                disabled={pagando}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="gold" disabled={pagando || !valorPagamento}>
                {pagando ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
