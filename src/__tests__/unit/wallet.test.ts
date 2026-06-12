import {
  verificarAlertaCarteira,
  calcularNovoSaldoCarteira,
  LIMITE_ALERTA_CARTEIRA,
} from '@/lib/utils/wallet'

describe('LIMITE_ALERTA_CARTEIRA', () => {
  it('deve ser R$ 300', () => {
    expect(LIMITE_ALERTA_CARTEIRA).toBe(300)
  })
})

describe('verificarAlertaCarteira', () => {
  it('retorna false para saldo abaixo do limite', () => {
    expect(verificarAlertaCarteira(299.99)).toBe(false)
  })

  it('retorna true para saldo exatamente no limite', () => {
    expect(verificarAlertaCarteira(300)).toBe(true)
  })

  it('retorna true para saldo acima do limite', () => {
    expect(verificarAlertaCarteira(300.01)).toBe(true)
  })

  it('retorna true para saldo muito alto', () => {
    expect(verificarAlertaCarteira(1000)).toBe(true)
  })

  it('retorna false para saldo zero', () => {
    expect(verificarAlertaCarteira(0)).toBe(false)
  })

  it('retorna false para saldo 1', () => {
    expect(verificarAlertaCarteira(1)).toBe(false)
  })
})

describe('calcularNovoSaldoCarteira', () => {
  it('soma ao saldo ao lançar fiado (charge)', () => {
    expect(calcularNovoSaldoCarteira(100, 50, 'charge')).toBe(150)
  })

  it('saldo zero com charge resulta no valor do charge', () => {
    expect(calcularNovoSaldoCarteira(0, 250, 'charge')).toBe(250)
  })

  it('subtrai do saldo ao registrar pagamento (payment)', () => {
    expect(calcularNovoSaldoCarteira(200, 80, 'payment')).toBe(120)
  })

  it('pagamento total zera o saldo', () => {
    expect(calcularNovoSaldoCarteira(150, 150, 'payment')).toBe(0)
  })

  it('pagamento maior que saldo resulta em zero, não negativo', () => {
    expect(calcularNovoSaldoCarteira(50, 100, 'payment')).toBe(0)
  })

  it('múltiplos charges acumulam corretamente', () => {
    const apos1 = calcularNovoSaldoCarteira(0, 100, 'charge')
    const apos2 = calcularNovoSaldoCarteira(apos1, 200, 'charge')
    expect(apos2).toBe(300)
  })
})
