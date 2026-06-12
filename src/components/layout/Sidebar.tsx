'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { fazerLogout } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Comandas', icon: ClipboardList },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/products', label: 'Produtos', icon: Package },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-brand-black flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <Image
          src="/brand/monograma-ag.png"
          alt="AG"
          width={36}
          height={36}
          className="object-contain"
        />
        <div>
          <p className="font-heading text-brand-gold text-sm font-bold leading-tight">
            Adega Gratidão
          </p>
          <p className="text-white/40 text-xs">Gestão de Comandas</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-gold text-brand-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-4 border-t border-white/10">
        <form action={fazerLogout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
