import React, { useEffect, useMemo, useState } from 'react'

type MenuItem = { id: string; name: string; price?: string; prices?: string[] }
type MenuSection = {
  id: string
  title?: string
  type?: 'single_price' | 'dual_price'
  price_headers?: string[]
  items: MenuItem[]
  special_item?: { name?: string; size?: string; price?: string; description?: string; image?: string }
}
type MenuData = { sections: MenuSection[] }

export function MenuEditor({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [localMenu, setLocalMenu] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/menu`)
        if (!res.ok) throw new Error('Failed to load menu')
        const data = (await res.json()) as MenuData
        setMenu(data)
        setLocalMenu(JSON.parse(JSON.stringify(data)))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [apiBaseUrl])

  const sections = useMemo(() => localMenu?.sections ?? [], [localMenu])

  if (loading) return <div className="text-sm text-zinc-600">Loading menu…</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-md border border-zinc-200 bg-white p-4">
          <div className="mb-2 text-base font-medium">{section.title || section.id}</div>
          <ul className="space-y-2">
            {(section.items ?? []).map((item) => (
              <li key={item.id} className="flex gap-2">
                <input
                  defaultValue={item.name}
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                {section.type === 'dual_price' ? (
                  <>
                    <input defaultValue={item.prices?.[0] ?? ''} className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    <input defaultValue={item.prices?.[1] ?? ''} className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  </>
                ) : (
                  <input defaultValue={item.price ?? ''} className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
