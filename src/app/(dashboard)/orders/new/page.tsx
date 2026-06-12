'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X, Plus, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClientForm } from '@/components/clients/ClientForm'
import { ProductPicker } from '@/components/products/ProductPicker'
import { QuantityStepper } from '@/components/orders/QuantityStepper'
import { TotalsSummary } from '@/components/orders/TotalsSummary'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { listClients } from '@/services/clients.service'
import { getOpenOrderByClient, createOrder, addOrderItem, updateOrderDiscounts } from '@/services/orders.service'
import { formatarMoeda } from '@/lib/utils/formatters'
import type { Client } from '@/types/database'
import type { Product } from '@/types/database'

type Step = 1 | 2 | 3

interface ItemDraft {
  tempId: string
  product_id: string
  product_name_snapshot: string
  unit_price_snapshot: number
  quantity: number
  final_unit_price: number
  line_total: number
}

const steps = ['Cliente', 'Produtos', 'Revisão']

export default function NovaComandaPage() {
  const router = useRouter()

  // Step
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null)
  const [clientFormOpen, setClientFormOpen] = useState(false)

  // Step 2
  const [items, setItems] = useState<ItemDraft[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

  // Step 3
  const [discountTotal, setDiscountTotal] = useState(0)
  const [surchargeTotal, setSurchargeTotal] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Busca de clientes
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await listClients(clientSearch || undefined)
      setClientResults(data ?? [])
    }, 250)
    return () => clearTimeout(timer)
  }, [clientSearch])

  async function handleSelectClient(client: Client) {
    setSelectedClient(client)
    setExistingOrderId(null)
    const { data } = await getOpenOrderByClient(client.id)
    if (data) {
      setExistingOrderId(data.id)
    } else {
      setStep(2)
    }
  }

  function handleAddProduct(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, line_total: (i.quantity + 1) * i.final_unit_price }
            : i
        )
      }
      return [...prev, {
        tempId: `t${Date.now()}`,
        product_id: product.id,
        product_name_snapshot: product.name,
        unit_price_snapshot: product.price,
        quantity: 1,
        final_unit_price: product.price,
        line_total: product.price,
      }]
    })
  }

  function handleQtyChange(tempId: string, qty: number) {
    setItems(prev => prev.map(i =>
      i.tempId === tempId
        ? { ...i, quantity: qty, line_total: qty * i.final_unit_price }
        : i
    ))
  }

  function handleRemoveItem(tempId: string) {
    setItems(prev => prev.filter(i => i.tempId !== tempId))
  }

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.line_total, 0), [items])
  const total = useMemo(
    () => Math.max(0, subtotal - discountTotal + surchargeTotal),
    [subtotal, discountTotal, surchargeTotal]
  )

  async function handleSave() {
    if (!selectedClient || items.length === 0) return
    setSaving(true)
    setSaveError(null)

    const { data: order, error } = await createOrder(selectedClient.id)
    if (!order) {
      setSaveError(error ?? 'Erro ao criar comanda.')
      setSaving(false)
      return
    }

    for (const item of items) {
      await addOrderItem({
        order_id: order.id,
        product_id: item.product_id,
        product_name_snapshot: item.product_name_snapshot,
        unit_price_snapshot: item.unit_price_snapshot,
        quantity: item.quantity,
        final_unit_price: item.final_unit_price,
      })
    }

    if (discountTotal > 0 || surchargeTotal > 0) {
      await updateOrderDiscounts(order.id, discountTotal, surchargeTotal)
    }

    router.push(`/orders/${order.id}`)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Nova Comanda</h1>
        </div>
        {/* Stepper dots */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i + 1 === step
                  ? 'w-5 bg-brand-gold'
                  : i + 1 < step
                  ? 'w-2 bg-brand-gold/50'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Título da etapa */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Etapa {step} — {steps[step - 1]}
      </p>

      {/* ── STEP 1: CLIENTE ─────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          {!selectedClient ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="pl-9 bg-white"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                {clientResults.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full bg-white rounded-xl border border-border p-4 flex items-center gap-3 text-left hover:border-brand-gold transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-brand-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{client.name}</p>
                      {client.phone && (
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      )}
                    </div>
                    {client.wallet_enabled && client.wallet_balance > 0 && (
                      <span className="text-xs text-amber-600 font-medium tabular-nums flex-shrink-0">
                        {formatarMoeda(client.wallet_balance)} fiado
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setClientFormOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-brand-gold hover:text-brand-gold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Novo Cliente
              </button>
            </>
          ) : existingOrderId ? (
            <div className="space-y-3">
              <AlertBanner
                variant="warning"
                message={`${selectedClient.name} já tem uma comanda em aberto.`}
              />
              <div className="flex gap-2">
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={() => router.push(`/orders/${existingOrderId}`)}
                >
                  Ver Comanda Aberta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedClient(null); setExistingOrderId(null) }}
                >
                  Outro Cliente
                </Button>
              </div>
            </div>
          ) : null}

          <ClientForm
            open={clientFormOpen}
            onOpenChange={setClientFormOpen}
            onSuccess={client => {
              setClientFormOpen(false)
              handleSelectClient(client)
            }}
          />
        </div>
      )}

      {/* ── STEP 2: PRODUTOS ────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Cliente selecionado (read-only) */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>{selectedClient?.name}</span>
          </div>

          <Button
            variant="gold-outline"
            className="w-full gap-2"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Adicionar Produto
          </Button>

          {items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum produto adicionado ainda.
            </p>
          ) : (
            <div className="bg-white rounded-xl border border-border px-4">
              {items.map(item => (
                <div key={item.tempId} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {item.product_name_snapshot}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatarMoeda(item.final_unit_price)} / un
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={qty => handleQtyChange(item.tempId, qty)}
                    />
                    <span className="w-16 text-right text-sm font-semibold tabular-nums">
                      {formatarMoeda(item.line_total)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.tempId)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <TotalsSummary
              subtotal={subtotal}
              total={total}
              actionLabel="Revisar Comanda"
              onAction={() => setStep(3)}
            />
          )}

          <ProductPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            onSelect={handleAddProduct}
          />
        </div>
      )}

      {/* ── STEP 3: REVISÃO ──────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          {saveError && <AlertBanner variant="error" message={saveError} />}

          {/* Resumo do cliente */}
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{selectedClient?.name}</p>
              <p className="text-xs text-muted-foreground">{items.length} produto{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Itens (somente leitura) */}
          <div className="bg-white rounded-xl border border-border px-4">
            {items.map(item => (
              <div key={item.tempId} className="flex justify-between items-center py-3 border-b border-border last:border-0 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.product_name_snapshot}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity}× {formatarMoeda(item.final_unit_price)}</p>
                </div>
                <span className="font-semibold tabular-nums ml-4">{formatarMoeda(item.line_total)}</span>
              </div>
            ))}
          </div>

          {/* Desconto / Acréscimo */}
          <div className="bg-white rounded-xl border border-border p-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Desconto (R$)
              </label>
              <Input
                type="number"
                value={discountTotal || ''}
                onChange={e => setDiscountTotal(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                min="0"
                step="0.50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Acréscimo (R$)
              </label>
              <Input
                type="number"
                value={surchargeTotal || ''}
                onChange={e => setSurchargeTotal(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                min="0"
                step="0.50"
              />
            </div>
          </div>

          <TotalsSummary
            subtotal={subtotal}
            discountTotal={discountTotal}
            surchargeTotal={surchargeTotal}
            total={total}
            actionLabel={saving ? 'Salvando...' : 'Salvar Comanda'}
            onAction={handleSave}
            disabled={saving}
          />
        </div>
      )}
    </div>
  )
}
