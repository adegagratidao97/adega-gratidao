import {
  formatarMoeda,
  formatarData,
  formatarHora,
  calcularTempoAberto,
} from '@/lib/utils/formatters'

describe('formatarMoeda', () => {
  it('formata 15 em reais', () => {
    const r = formatarMoeda(15)
    expect(r).toContain('R$')
    expect(r).toContain('15,00')
  })

  it('formata 1500.5 com separador de milhar', () => {
    const r = formatarMoeda(1500.5)
    expect(r).toContain('R$')
    expect(r).toContain('1.500,50')
  })

  it('formata zero', () => {
    const r = formatarMoeda(0)
    expect(r).toContain('R$')
    expect(r).toContain('0,00')
  })

  it('formata valor com centavos', () => {
    const r = formatarMoeda(29.99)
    expect(r).toContain('29,99')
  })
})

describe('formatarData', () => {
  it('exibe data no formato dd/mm/yyyy', () => {
    const data = new Date(2026, 0, 15)
    expect(formatarData(data)).toBe('15/01/2026')
  })

  it('aceita string de data', () => {
    const r = formatarData('2026-06-09')
    expect(r).toContain('2026')
  })
})

describe('formatarHora', () => {
  it('exibe hora no formato hh:mm', () => {
    const data = new Date(2026, 0, 15, 14, 30)
    expect(formatarHora(data)).toBe('14:30')
  })

  it('formata meia-noite como 00:00', () => {
    const data = new Date(2026, 0, 15, 0, 0)
    expect(formatarHora(data)).toBe('00:00')
  })
})

describe('calcularTempoAberto', () => {
  it('retorna minutos para comandas com menos de 1 hora', () => {
    const abertura = new Date(Date.now() - 30 * 60_000)
    expect(calcularTempoAberto(abertura)).toBe('30min')
  })

  it('retorna 1min para comanda recém aberta', () => {
    const abertura = new Date(Date.now() - 1 * 60_000)
    expect(calcularTempoAberto(abertura)).toBe('1min')
  })

  it('retorna horas para comandas com 1h ou mais', () => {
    const abertura = new Date(Date.now() - 2 * 60 * 60_000)
    expect(calcularTempoAberto(abertura)).toBe('2h')
  })

  it('retorna horas exatas para 3h', () => {
    const abertura = new Date(Date.now() - 3 * 60 * 60_000)
    expect(calcularTempoAberto(abertura)).toBe('3h')
  })
})
