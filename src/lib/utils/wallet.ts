export const LIMITE_ALERTA_CARTEIRA = 300

export function verificarAlertaCarteira(saldo: number): boolean {
  return saldo >= LIMITE_ALERTA_CARTEIRA
}

export function calcularNovoSaldoCarteira(
  saldoAtual: number,
  valor: number,
  tipo: 'charge' | 'payment'
): number {
  if (tipo === 'charge') return saldoAtual + valor
  return Math.max(0, saldoAtual - valor)
}
