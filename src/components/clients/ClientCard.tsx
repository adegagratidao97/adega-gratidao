import Link from 'next/link'
import { ChevronRight, Phone, Wallet, AlertTriangle, User } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils/formatters'
import { verificarAlertaCarteira } from '@/lib/utils/wallet'
import type { Client } from '@/types/database'

interface Props {
  client: Client
}

export function ClientCard({ client }: Props) {
  const temAlerta = client.wallet_enabled && verificarAlertaCarteira(client.wallet_balance)

  return (
    <Link href={`/clients/${client.id}`} className="block group">
      <div className="bg-white rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm group-hover:shadow-md transition-shadow">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-brand-gold" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-foreground truncate">{client.name}</p>
            {temAlerta && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {client.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                {client.phone}
              </span>
            )}
            {client.wallet_enabled && (
              <span className={`flex items-center gap-1 text-xs font-medium ${temAlerta ? 'text-amber-600' : 'text-muted-foreground'}`}>
                <Wallet className="w-3 h-3" />
                {formatarMoeda(client.wallet_balance)}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  )
}
