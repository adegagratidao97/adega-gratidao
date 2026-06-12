import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  active: z.boolean().default(true),
  available: z.boolean().default(true),
  category: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
