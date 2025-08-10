// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type OrderItem = { menu_item_id: string; quantity: number; notes?: string }
type CreateOrderPayload = {
  user_id: string
  items: OrderItem[]
  pickup_time: string
  share_location?: boolean
  // Optional PostGIS point (either GeoJSON-like object or WKT string)
  current_location?: any
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const authHeader = req.headers.get('Authorization') ?? ''

  const supabase = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  try {
    const payload = (await req.json()) as CreateOrderPayload

    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Resolve user from the incoming JWT
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authData.user.id

    if (payload.user_id !== userId) {
      return Response.json({ error: 'user_id mismatch' }, { status: 403 })
    }

    // Optional: validate menu items exist and are active
    const menuIds = payload.items.map((i) => i.menu_item_id)
    const { data: menuItems, error: miErr } = await supabase
      .from('menu_items')
      .select('id,is_active')
      .in('id', menuIds)

    if (miErr) return Response.json({ error: miErr.message }, { status: 400 })
    const validIds = new Set((menuItems ?? []).filter((m: any) => m.is_active).map((m: any) => m.id))
    for (const it of payload.items) {
      if (!validIds.has(it.menu_item_id) || it.quantity <= 0) {
        return Response.json({ error: 'Invalid items' }, { status: 400 })
      }
    }

    // Insert order atomically
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        items: payload.items,
        pickup_time: payload.pickup_time,
        share_location: Boolean(payload.share_location),
        // Only set current_location if provided
        ...(payload.current_location ? { current_location: payload.current_location } : {}),
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ id: data.id }, { status: 200 })
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 })
  }
}

// Standard Supabase Edge runtime export
export default handler

