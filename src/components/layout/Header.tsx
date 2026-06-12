'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const titulos: Record<string, string> = {
  '/home': 'Dashboard',
  '/orders': 'Comandas',
  '/orders/new': 'Nova Comanda',
  '/clients': 'Clientes',
  '/products': 'Produtos',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
}

function getTitulo(pathname: string): string {
  if (titulos[pathname]) return titulos[pathname]
  if (pathname.startsWith('/orders/')) return 'Detalhe da Comanda'
  if (pathname.startsWith('/clients/')) return 'Cliente'
  return 'Adega Gratidão'
}

export function Header() {
  const pathname = usePathname()
  const titulo = getTitulo(pathname)

  return (
    <header className="flex md:hidden fixed top-0 left-0 right-0 h-14 bg-brand-black z-40 items-center justify-between px-4 border-b border-white/10">
      <Image
        src="/brand/monograma-ag.png"
        alt="AG"
        width={30}
        height={30}
        className="object-contain"
      />
      <h1 className="text-white font-medium text-sm">{titulo}</h1>
      {/* Espaçador para centralizar o título */}
      <div className="w-7" />
    </header>
  )
}
