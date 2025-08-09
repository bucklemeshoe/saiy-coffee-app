import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = { id: string; name: string; price: number; quantity: number; notes?: string }

type CartState = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  remove: (id: string) => void
  updateQty: (id: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQty: (id, quantity) =>
        set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart' },
  ),
)

