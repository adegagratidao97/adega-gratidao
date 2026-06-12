import {
  calcularLineTotalItem,
  calcularFinalUnitPrice,
  calcularSubtotal,
  calcularTotalComanda,
} from '@/lib/utils/calculations'

describe('calcularLineTotalItem', () => {
  it('multiplica quantidade pelo preço final unitário', () => {
    expect(calcularLineTotalItem(3, 15)).toBe(45)
  })

  it('funciona com decimais', () => {
    expect(calcularLineTotalItem(2, 12.5)).toBe(25)
  })

  it('retorna zero quando quantidade é zero', () => {
    expect(calcularLineTotalItem(0, 15)).toBe(0)
  })
})

describe('calcularFinalUnitPrice', () => {
  it('aplica desconto corretamente', () => {
    expect(calcularFinalUnitPrice(20, 5, 0)).toBe(15)
  })

  it('aplica acréscimo corretamente', () => {
    expect(calcularFinalUnitPrice(15, 0, 5)).toBe(20)
  })

  it('desconto não pode deixar preço abaixo de zero', () => {
    expect(calcularFinalUnitPrice(10, 20, 0)).toBe(0)
  })

  it('desconto e acréscimo simultâneos', () => {
    expect(calcularFinalUnitPrice(20, 5, 3)).toBe(18)
  })

  it('sem desconto nem acréscimo retorna preço base', () => {
    expect(calcularFinalUnitPrice(15, 0, 0)).toBe(15)
  })
})

describe('calcularSubtotal', () => {
  it('soma todos os line_total dos itens', () => {
    const itens = [{ line_total: 30 }, { line_total: 45 }, { line_total: 25 }]
    expect(calcularSubtotal(itens)).toBe(100)
  })

  it('retorna zero para lista vazia', () => {
    expect(calcularSubtotal([])).toBe(0)
  })

  it('funciona com item único', () => {
    expect(calcularSubtotal([{ line_total: 75.5 }])).toBe(75.5)
  })
})

describe('calcularTotalComanda', () => {
  it('total = subtotal - desconto + acréscimo', () => {
    expect(calcularTotalComanda(100, 10, 5)).toBe(95)
  })

  it('total não pode ser negativo', () => {
    expect(calcularTotalComanda(50, 100, 0)).toBe(0)
  })

  it('desconto maior que subtotal resulta em zero', () => {
    expect(calcularTotalComanda(30, 50, 0)).toBe(0)
  })

  it('acréscimo sem desconto soma ao subtotal', () => {
    expect(calcularTotalComanda(100, 0, 20)).toBe(120)
  })

  it('desconto e acréscimo iguais mantêm subtotal', () => {
    expect(calcularTotalComanda(100, 10, 10)).toBe(100)
  })

  it('sem desconto nem acréscimo retorna subtotal', () => {
    expect(calcularTotalComanda(150, 0, 0)).toBe(150)
  })
})
