import { z } from 'zod'

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable().optional(),
  price: z.number().nonnegative(),
  image_url: z.string().url().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
})

export const OrderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
})

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1),
  status: z.enum(['pending', 'preparing', 'ready', 'collected', 'cancelled']).default('pending'),
  pickup_time: z.string().datetime(),
  share_location: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
})

export type MenuItem = z.infer<typeof MenuItemSchema>
export type Order = z.infer<typeof OrderSchema>

