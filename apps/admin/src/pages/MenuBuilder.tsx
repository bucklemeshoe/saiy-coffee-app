import { useEffect, useMemo, useState } from 'react'

export default function MenuBuilder() {
  const baseUrl = '' // Coffee-Menu removed

  // Inline editor state
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

  const [menu] = useState<MenuData | null>(null)
  const [localMenu] = useState<MenuData | null>(null)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [savingItemId] = useState<string | null>(null)
  const [savedItemId] = useState<string | null>(null)
  const [savingSectionId] = useState<string | null>(null)

  useEffect(() => { /* Coffee-Menu removed; no-op */ }, [])

  const sections = useMemo(() => localMenu?.sections ?? [], [localMenu])

  const refreshMenu = async () => {}

  const ensureSectionItems = (sectionId: string) => {
    setLocalMenu((prev) => {
      if (!prev) return prev
      const copy = { ...prev, sections: prev.sections.map((s) => ({ ...s })) }
      const sIdx = copy.sections.findIndex((s) => s.id === sectionId)
      if (sIdx === -1) return prev
      const s = copy.sections[sIdx]
      if (!Array.isArray(s.items)) s.items = []
      return copy
    })
  }

  const handleFieldChange = (
    sectionId: string,
    itemId: string,
    field: 'name' | 'price' | 'prices',
    value: string,
    priceIndex?: number,
  ) => {
    setLocalMenu((prev) => {
      if (!prev) return prev
      const copy = { ...prev, sections: prev.sections.map((s) => ({ ...s, items: (s.items ?? []).map((it) => ({ ...it })) })) }
      const section = copy.sections.find((s) => s.id === sectionId)
      if (!section) return prev
      const item = (section.items ?? []).find((it) => it.id === itemId)
      if (!item) return prev
      if (field === 'name') item.name = value
      else if (field === 'price') item.price = value
      else if (field === 'prices') {
        if (!Array.isArray(item.prices)) item.prices = ['', '']
        const idx = typeof priceIndex === 'number' ? priceIndex : 0
        item.prices[idx] = value
      }
      return copy
    })
  }

  const handleAddItem = (sectionId: string, type: MenuSection['type']) => {
    ensureSectionItems(sectionId)
    setLocalMenu((prev) => {
      if (!prev) return prev
      const tempId = `temp_${Date.now()}`
      const copy = { ...prev, sections: prev.sections.map((s) => ({ ...s, items: (s.items ?? []).map((it) => ({ ...it })) })) }
      const section = copy.sections.find((s) => s.id === sectionId)
      if (!section) return prev
      const newItem: MenuItem = { id: tempId, name: '', ...(type === 'dual_price' ? { prices: ['', ''] } : { price: '' }) }
      if (!Array.isArray(section.items)) section.items = []
      section.items.unshift(newItem)
      return copy
    })
  }

  const handleSaveItem = async (sectionId: string, itemId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    const item = section?.items?.find((it) => it.id === itemId)
    if (!section || !item) return
    setSavingItemId(itemId)
    try {
      if (itemId.startsWith('temp_')) {
        const res = await fetch(`${baseUrl}/api/menu/section/${encodeURIComponent(sectionId)}/item`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, id: undefined })
        })
        if (!res.ok) throw new Error('Failed to add item')
      } else {
        const res = await fetch(`${baseUrl}/api/menu/section/${encodeURIComponent(sectionId)}/item/${encodeURIComponent(itemId)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item)
        })
        if (!res.ok) throw new Error('Failed to save item')
      }
      await refreshMenu()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSavingItemId(null)
      setSavedItemId(itemId)
      setTimeout(() => setSavedItemId((prev) => (prev === itemId ? null : prev)), 1200)
    }
  }

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    if (itemId.startsWith('temp_')) {
      setLocalMenu((prev) => {
        if (!prev) return prev
        const copy = { ...prev, sections: prev.sections.map((s) => ({ ...s, items: (s.items ?? []).filter((it) => it.id !== itemId) })) }
        return copy
      })
      return
    }
    if (!confirm('Delete this item?')) return
    setSavingItemId(itemId)
    try {
      const res = await fetch(`${baseUrl}/api/menu/section/${encodeURIComponent(sectionId)}/item/${encodeURIComponent(itemId)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      await refreshMenu()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setSavingItemId(null)
    }
  }

  const handleSpecialChange = (sectionId: string, field: 'name' | 'size' | 'price' | 'description' | 'image', value: string) => {
    setLocalMenu((prev) => {
      if (!prev) return prev
      const copy = { ...prev, sections: prev.sections.map((s) => ({ ...s })) }
      const s = copy.sections.find((s) => s.id === sectionId)
      if (!s) return prev
      if (!s.special_item) s.special_item = {}
      s.special_item[field] = value
      return copy
    })
  }

  const handleSaveSpecial = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    setSavingSectionId(sectionId)
    try {
      const res = await fetch(`${baseUrl}/api/menu/section/${encodeURIComponent(sectionId)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ special_item: section.special_item ?? {} })
      })
      if (!res.ok) throw new Error('Failed to save special item')
      await refreshMenu()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSavingSectionId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1">Menu Builder</h1>
          <p className="text-zinc-600">Manage the digital menu content used for kiosk/display and link it to the mobile app</p>
        </div>
        <div className="flex items-center gap-2" />
      </div>

      <div className="text-sm text-zinc-600">Menu service not configured.</div>

      {/* Inline editor removed with Coffee-Menu. */}

      {!loading && !error && baseUrl && (menu?.sections ?? []).length === 0 && (
        <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600">No sections found.</div>
      )}

      <div className="text-sm text-zinc-600">Menu Builder is ready. Connect to your new data source when available.</div>
    </div>
  )
}
