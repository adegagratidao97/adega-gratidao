import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fixa — desktop */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex flex-col flex-1 md:ml-60">
        {/* Header fixo — mobile */}
        <Header />

        <main className="flex-1 p-4 md:p-6 mt-14 md:mt-0 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto">
            {children}
          </div>
        </main>

        {/* Bottom nav fixo — mobile */}
        <BottomNav />
      </div>
    </div>
  )
}
