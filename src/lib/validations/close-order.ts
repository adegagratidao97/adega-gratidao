import { z } from 'zod'

export const closeOrderSchema = z.object({
  status: z.enum(['paga', 'fiado', 'cancelada']),
  payment_type: z.string().optional(),
  notes: z.string().optional(),
})

export type CloseOrderInput = z.infer<typeof closeOrderSchema>
