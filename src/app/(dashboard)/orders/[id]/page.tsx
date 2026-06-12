'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Scissors, CheckCircle } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import { useOrderMutations } from '@/hooks/useOrders'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { OrderItemRow } from '@/components/orders/OrderItemRow'
import { ProductPicker } from '@/components/products/ProductPicker'
import { GlobalDiscountDrawer } from '@/components/orders/GlobalDiscountDrawer'
import { CloseOrderModal } from '@/components/orders/CloseOrderModal'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { Button } from '@/components/ui/button'
import { formatarMoeda, calcularTempoAberto, formatarData, formatarHora } from '@/lib/utils/formatters'
import type { Product } from '@/types/database'

export default function ComandaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { order, items, loading, error, refresh } = useOrder(id)
  const { addItem, updateItem, removeItem, updateDiscounts } = useOrderMutations()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)

  const isOpen = order?.status === 'aberta'

  async function handleAddProduct(product: Product) {
    if (!order) return
    await addItem({
      order_id: order.id,
      product_id: product.id,
      product_name_snapshot: product.name,
      unit_price_snapshot: product.price,
      quantity: 1,
      final_unit_price: product.price,
    })
    refresh()
  }

  async function handleQtyChange(itemId: string, qty: number) {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    await updateItem(itemId, { quantity: qty, final_unit_price: item.final_unit_price })
    refresh()
  }

  async function handleRemoveItem(itemId: string) {
    await removeItem(itemId)
    refresh()
  }

  async function handleApplyDiscount(discount: number, surcharge: number) {
    if (!order) return
    await updateDiscounts(order.id, discount, surcharge)
    refresh()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!order || error) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">Comanda não encontrada.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-40">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground">
              #{order.order_number}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {order.client?.name ?? '—'}
          </p>
        </div>
        {isOpen && (
          <span suppressHydrationWarning className="text-xs text-muted-foreground flex-shrink-0">
            {calcularTempoAberto(order.opened_at)}
          </span>
        )}
        {!isOpen && order.closed_at && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatarData(order.closed_at)}
          </span>
        )}
      </div>

      {/* Itens */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Itens ({items.length})
          </p>
        </div>
        <div className="px-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum item adicionado.</p>
          ) : (
            items.map(item => (
              <OrderItemRow
                key={item.id}
                item={item}
                editable={isOpen}
                onQtyChange={handleQtyChange}
                onRemove={handleRemoveItem}
              />
            ))
          )}
        </div>
        {isOpen && (
          <div className="px-4 py-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-brand-gold hover:text-brand-gold hover:bg-brand-gold/10 w-full"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Adicionar Produto
            </Button>
          </div>
        )}
      </div>

      {/* Totais */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatarMoeda(order.subtotal)}</span>
        </div>
        {order.discount_total > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Desconto</span>
            <span className="tabular-nums">−{formatarMoeda(order.discount_total)}</span>
          </div>
        )}
        {order.surcharge_total > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Acréscimo</span>
            <span className="tabular-nums">+{formatarMoeda(order.surcharge_total)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
          <span>Total</span>
          <span className="tabular-nums text-brand-gold">{formatarMoeda(order.total)}</span>
        </div>
      </div>

      {/* Info de fechamento */}
      {!isOpen && (
        <div className="bg-white rounded-xl border border-border p-4 text-sm space-y-1">
          {order.payment_type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Forma de pagamento</span>
              <span className="font-medium capitalize">{order.payment_type.replace('_', ' ')}</span>
            </div>
          )}
          {order.closed_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fechado em</span>
              <span>{formatarData(order.closed_at)} {formatarHora(order.closed_at)}</span>
            </div>
          )}
          {order.cancelled_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cancelado em</span>
              <span>{formatarData(order.cancelled_at)} {formatarHora(order.cancelled_at)}</span>
            </div>
          )}
        </div>
      )}

      {/* Ações para comanda aberta */}
      {isOpen && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:relative bg-white border-t border-border md:border md:rounded-xl p-4 space-y-2 z-20 md:static">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setDiscountOpen(true)}
          >
            <Scissors className="w-4 h-4" />
            Desconto / Acréscimo
          </Button>
          <Button
            variant="gold"
            className="w-full h-11 gap-2 font-semibold"
            onClick={() => setCloseOpen(true)}
            disabled={items.length === 0}
          >
            <CheckCircle className="w-4 h-4" />
            Fechar Comanda
          </Button>
          {items.length === 0 && (
            <AlertBanner variant="info" message="Adicione ao menos um produto para fechar a comanda." />
          )}
        </div>
      )}

      {/* Modais */}
      <ProductPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddProduct}
      />

      <GlobalDiscountDrawer
        open={discountOpen}
        onOpenChange={setDiscountOpen}
        currentDiscount={order.discount_total}
        currentSurcharge={order.surcharge_total}
        subtotal={order.subtotal}
        onApply={handleApplyDiscount}
      />

      {closeOpen && (
        <CloseOrderModal
          open={closeOpen}
          onOpenChange={setCloseOpen}
          order={order}
          onSuccess={() => router.push('/home')}
        />
      )}
    </div>
  )
}
