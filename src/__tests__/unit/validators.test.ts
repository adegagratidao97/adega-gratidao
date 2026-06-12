import {
  clientSchema,
  productSchema,
  orderItemSchema,
  closeOrderSchema,
} from '@/lib/validations'

describe('clientSchema', () => {
  it('aceita cliente válido com nome', () => {
    const r = clientSchema.safeParse({ name: 'João Silva', wallet_enabled: false })
    expect(r.success).toBe(true)
  })

  it('rejeita cliente sem nome', () => {
    const r = clientSchema.safeParse({ name: '', wallet_enabled: false })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Nome é obrigatório')
  })

  it('rejeita cliente sem campo name', () => {
    const r = clientSchema.safeParse({ wallet_enabled: false })
    expect(r.success).toBe(false)
  })

  it('aceita telefone como null', () => {
    const r = clientSchema.safeParse({ name: 'João', phone: null, wallet_enabled: false })
    expect(r.success).toBe(true)
  })

  it('aceita telefone como string', () => {
    const r = clientSchema.safeParse({ name: 'João', phone: '11999999999', wallet_enabled: false })
    expect(r.success).toBe(true)
  })

  it('wallet_enabled default é false', () => {
    const r = clientSchema.safeParse({ name: 'João' })
    expect(r.success && r.data.wallet_enabled).toBe(false)
  })
})

describe('productSchema', () => {
  it('aceita produto válido', () => {
    const r = productSchema.safeParse({ name: 'Vinho Tinto', price: 45.0 })
    expect(r.success).toBe(true)
  })

  it('rejeita produto sem nome', () => {
    const r = productSchema.safeParse({ name: '', price: 45.0 })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Nome é obrigatório')
  })

  it('rejeita preço negativo', () => {
    const r = productSchema.safeParse({ name: 'Vinho', price: -5 })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Preço não pode ser negativo')
  })

  it('aceita preço zero', () => {
    const r = productSchema.safeParse({ name: 'Brinde', price: 0 })
    expect(r.success).toBe(true)
  })

  it('active default é true', () => {
    const r = productSchema.safeParse({ name: 'Cerveja', price: 8 })
    expect(r.success && r.data.active).toBe(true)
  })

  it('available default é true', () => {
    const r = productSchema.safeParse({ name: 'Cerveja', price: 8 })
    expect(r.success && r.data.available).toBe(true)
  })
})

describe('orderItemSchema', () => {
  const itemValido = {
    product_name_snapshot: 'Vinho Tinto',
    unit_price_snapshot: 45.0,
    quantity: 2,
    final_unit_price: 45.0,
  }

  it('aceita item válido', () => {
    const r = orderItemSchema.safeParse(itemValido)
    expect(r.success).toBe(true)
  })

  it('rejeita quantidade zero', () => {
    const r = orderItemSchema.safeParse({ ...itemValido, quantity: 0 })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Quantidade deve ser maior que zero')
  })

  it('rejeita quantidade negativa', () => {
    const r = orderItemSchema.safeParse({ ...itemValido, quantity: -1 })
    expect(r.success).toBe(false)
  })

  it('discount_value default é 0', () => {
    const r = orderItemSchema.safeParse(itemValido)
    expect(r.success && r.data.discount_value).toBe(0)
  })

  it('surcharge_value default é 0', () => {
    const r = orderItemSchema.safeParse(itemValido)
    expect(r.success && r.data.surcharge_value).toBe(0)
  })

  it('aceita product_id como null', () => {
    const r = orderItemSchema.safeParse({ ...itemValido, product_id: null })
    expect(r.success).toBe(true)
  })
})

describe('closeOrderSchema', () => {
  it('aceita status paga', () => {
    const r = closeOrderSchema.safeParse({ status: 'paga' })
    expect(r.success).toBe(true)
  })

  it('aceita status fiado', () => {
    const r = closeOrderSchema.safeParse({ status: 'fiado' })
    expect(r.success).toBe(true)
  })

  it('aceita status cancelada', () => {
    const r = closeOrderSchema.safeParse({ status: 'cancelada' })
    expect(r.success).toBe(true)
  })

  it('rejeita status inválido', () => {
    const r = closeOrderSchema.safeParse({ status: 'aberta' })
    expect(r.success).toBe(false)
  })

  it('aceita payment_type opcional', () => {
    const r = closeOrderSchema.safeParse({ status: 'paga', payment_type: 'dinheiro' })
    expect(r.success).toBe(true)
  })
})
