import { z } from 'zod'

export const orderItemSchema = z.object({
  product_id: z.string().nullable().optional(),
  product_name_snapshot: z.string().min(1),
  unit_price_snapshot: z.number().min(0),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantidade deve ser maior que zero'),
  discount_value: z.number().min(0).default(0),
  surcharge_value: z.number().min(0).default(0),
  final_unit_price: z.number().min(0),
})

export type OrderItemInput = z.infer<typeof orderItemSchema>
