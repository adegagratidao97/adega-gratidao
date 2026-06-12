'use client'
import { useFormStatus } from 'react-dom'
import Image from 'next/image'
import { fazerLogin } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="gold"
      className="w-full h-10 text-sm font-semibold mt-2"
      disabled={pending}
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/brand/logo-branco.png"
            alt="Adega Gratidão"
            width={200}
            height={90}
            className="object-contain"
            priority
          />
          <p className="text-white/40 text-xs tracking-widest uppercase">
            Sistema de Gestão
          </p>
        </div>

        {/* Formulário */}
        <form action={fazerLogin} className="space-y-3">
          <Input
            type="email"
            name="email"
            placeholder="E-mail"
            defaultValue="admin@gratidao.com"
            className="bg-brand-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-brand-gold"
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Senha"
            defaultValue="12345678"
            className="bg-brand-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-brand-gold"
            required
          />
          <SubmitButton />
        </form>

        <p className="text-center text-white/20 text-xs">
          Adega Gratidão © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
