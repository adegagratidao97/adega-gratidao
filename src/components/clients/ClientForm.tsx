'use client'
import { useState, useEffect } from 'react'
import { useClientMutations } from '@/hooks/useClients'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertBanner } from '@/components/shared/AlertBanner'
import type { Client } from '@/types/database'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
  onSuccess?: (client: Client) => void
}

interface FormState {
  name: string
  phone: string
  wallet_enabled: boolean
  wallet_limit: string
  notes: string
}

const emptyForm: FormState = {
  name: '',
  phone: '',
  wallet_enabled: false,
  wallet_limit: '300',
  notes: '',
}

export function ClientForm({ open, onOpenChange, client, onSuccess }: Props) {
  const { create, update, loading, error } = useClientMutations()
  const isEdit = !!client

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        phone: client.phone ?? '',
        wallet_enabled: client.wallet_enabled,
        wallet_limit: String(client.wallet_limit),
        notes: client.notes ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [client, open])

  function set(field: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      wallet_enabled: form.wallet_enabled,
      wallet_limit: Number(form.wallet_limit) || 300,
      notes: form.notes.trim() || undefined,
    }

    const result = isEdit
      ? await update(client!.id, input)
      : await create(input)

    if (result) {
      onSuccess?.(result)
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-2">
          {error && <AlertBanner variant="error" message={error} />}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nome *
            </label>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Nome do cliente"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Telefone
            </label>
            <Input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="(99) 99999-9999"
              type="tel"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Observações
            </label>
            <Input
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Preferências, detalhes..."
            />
          </div>

          {/* Carteira */}
          <div className="rounded-xl border border-border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Carteira (Fiado)</p>
                <p className="text-xs text-muted-foreground">
                  Permite fechar comandas no fiado
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('wallet_enabled', !form.wallet_enabled)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${
                  form.wallet_enabled ? 'bg-brand-gold' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    form.wallet_enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {form.wallet_enabled && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Limite de Alerta (R$)
                </label>
                <Input
                  type="number"
                  value={form.wallet_limit}
                  onChange={e => set('wallet_limit', e.target.value)}
                  min="0"
                  step="50"
                  placeholder="300"
                />
              </div>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={loading || !form.name.trim()}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Cliente'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
