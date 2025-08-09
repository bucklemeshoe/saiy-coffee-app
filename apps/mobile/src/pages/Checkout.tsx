import { useState } from 'react'
import { useSupabase } from '../lib/useSupabase'
import { useCartStore } from '../store/cart'
import { useUser } from '@clerk/clerk-react'

export default function CheckoutPage() {
  const supabase = useSupabase()
  const { user } = useUser()
  const { items, clear } = useCartStore()
  const [pickupTime, setPickupTime] = useState<string>('ASAP')
  const [shareLocation, setShareLocation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submitOrder() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      if (!user) throw new Error('Sign in required')
      if (items.length === 0) throw new Error('Cart is empty')

      // Ensure profile row exists
      await supabase.from('users').upsert({ id: user.id, email: user.primaryEmailAddress?.emailAddress ?? null })

      const payload = {
        user_id: user.id,
        items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        pickup_time: pickupTime === 'ASAP' ? new Date().toISOString() : new Date(pickupTime).toISOString(),
        share_location: shareLocation,
      }

      const resp = await fetch('/functions/v1/create_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await supabase.auth.getSession().then((r) => r.data.session?.access_token ?? '')}`,
        },
        body: JSON.stringify(payload),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error ?? 'Failed to create order')
      setSuccess(`Order placed. ID: ${json.id}`)
      clear()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <div>
        <label className="block text-sm">Pickup</label>
        <select
          className="mt-1 rounded border border-zinc-300 px-2 py-1"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
        >
          <option>ASAP</option>
          <option value={new Date(Date.now() + 15 * 60 * 1000).toISOString()}>In 15 minutes</option>
          <option value={new Date(Date.now() + 30 * 60 * 1000).toISOString()}>In 30 minutes</option>
        </select>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} />
        Share live location (optional)
      </label>
      <button
        className="px-3 py-2 rounded-md bg-zinc-900 text-white"
        onClick={submitOrder}
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Place order'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </div>
  )
}

