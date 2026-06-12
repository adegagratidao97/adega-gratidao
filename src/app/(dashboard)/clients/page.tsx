'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientSearch } from '@/components/clients/ClientSearch'
import { ClientForm } from '@/components/clients/ClientForm'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { listClients } from '@/services/clients.service'
import { verificarAlertaCarteira } from '@/lib/utils/wallet'
import type { Client } from '@/types/database'

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await listClients(search || undefined)
    setClients(data ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const clientesComAlerta = clients.filter(
    c => c.wallet_enabled && verificarAlertaCarteira(c.wallet_balance)
  )

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Clientes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? '...' : `${clients.length} cadastrado${clients.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button variant="gold" size="sm" className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Cliente</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Alerta de clientes com saldo alto */}
      {clientesComAlerta.length > 0 && (
        <AlertBanner
          variant="warning"
          message={`${clientesComAlerta.length} cliente${clientesComAlerta.length > 1 ? 's' : ''} com saldo acima do limite de alerta.`}
        />
      )}

      {/* Busca */}
      <ClientSearch value={search} onChange={setSearch} />

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-border">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          {search ? (
            <p className="text-sm text-muted-foreground">
              Nenhum cliente encontrado para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado</p>
              <Button
                variant="gold"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => setFormOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Cliente
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => load()}
      />
    </div>
  )
}
