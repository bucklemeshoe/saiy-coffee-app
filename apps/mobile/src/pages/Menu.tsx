import { useEffect, useState } from 'react'
import { useSupabase } from '../lib/useSupabase'
import { useCartStore } from '../store/cart'

export default function MenuPage() {
  const supabase = useSupabase()
  const add = useCartStore((s) => s.add)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<{ id: string; name: string; price: number }[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('menu_items')
        .select('id,name,price')
        .eq('is_active', true)
        .order('name')
      if (error) setError(error.message)
      setItems(data ?? [])
      setLoading(false)
    })()
  }, [supabase])

  if (loading) return <div className="p-4">Loading…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Menu</h1>
      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m.id} className="flex items-center justify-between border-b border-zinc-200 py-2">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-zinc-500">{m.price.toFixed(2)}</div>
            </div>
            <button
              className="px-3 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              onClick={() => add({ id: m.id, name: m.name, price: m.price })}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

