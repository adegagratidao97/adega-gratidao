import { cn } from '@/lib/utils'
import { AlertTriangle, Info, XCircle } from 'lucide-react'

const variants = {
  warning: {
    className: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
  },
  error: {
    className: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconClass: 'text-red-500',
  },
  info: {
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconClass: 'text-blue-500',
  },
}

interface Props {
  variant: 'warning' | 'error' | 'info'
  message: string
  className?: string
}

export function AlertBanner({ variant, message, className }: Props) {
  const config = variants[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm',
        config.className,
        className
      )}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.iconClass)} />
      <p className="leading-snug">{message}</p>
    </div>
  )
}
