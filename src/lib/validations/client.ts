import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().nullable().optional(),
  wallet_enabled: z.boolean().default(false),
  wallet_limit: z.number().default(300),
  notes: z.string().nullable().optional(),
})

export type ClientInput = z.infer<typeof clientSchema>
