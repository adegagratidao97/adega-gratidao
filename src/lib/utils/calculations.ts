export function calcularLineTotalItem(
  quantidade: number,
  precoFinalUnitario: number
): number {
  return quantidade * precoFinalUnitario
}

export function calcularFinalUnitPrice(
  precoBase: number,
  desconto: number,
  acrescimo: number
): number {
  return Math.max(0, precoBase - desconto + acrescimo)
}

export function calcularSubtotal(
  itens: Array<{ line_total: number }>
): number {
  return itens.reduce((acc, item) => acc + item.line_total, 0)
}

export function calcularTotalComanda(
  subtotal: number,
  descontoTotal: number,
  acrescimoTotal: number
): number {
  return Math.max(0, subtotal - descontoTotal + acrescimoTotal)
}
