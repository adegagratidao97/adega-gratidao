const moedaBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatarMoeda(valor: number): string {
  return moedaBRL.format(valor)
}

export function formatarData(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data
  return d.toLocaleDateString('pt-BR')
}

export function formatarHora(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function calcularTempoAberto(dataAbertura: Date | string): string {
  const abertura =
    typeof dataAbertura === 'string' ? new Date(dataAbertura) : dataAbertura
  const minutos = Math.floor((Date.now() - abertura.getTime()) / 60_000)
  if (minutos < 60) return `${minutos}min`
  return `${Math.floor(minutos / 60)}h`
}
