import { Route, Routes } from 'react-router-dom'
import { useMemo } from 'react'
import AdminLayout from './layout/AdminLayout'
import AdminPage from './pages/AdminPage'
import { createSupabaseWithExternalAuth } from '@order-app/lib'
import { useRealtimeOrders } from '@order-app/lib'

export function AppLocal() {
  // Local supabase client without Clerk
  const supabase = useMemo(
    () => createSupabaseWithExternalAuth(() => Promise.resolve(null)),
    []
  )
  const { orders, loading, error } = useRealtimeOrders(supabase)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status')
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-50 text-zinc-900">
      <AdminLayout>
      <Routes>
        <Route
          path="/"
          element={
            <AdminPage
              orders={(orders || []).map(o => ({
                id: o.id,
                placedAt: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                pickupEta: o.pickup_time ?? '-',
                items: Array.isArray(o.items) ? o.items.map((it: any) => ({ 
                  name: it.name ?? 'Item', 
                  qty: it.qty ?? it.quantity ?? 1, 
                  quantity: it.qty ?? it.quantity ?? 1,
                  price: Number(it.price ?? 0) 
                })) : [],
                total: Array.isArray(o.items) ? o.items.reduce((sum: number, it: any) => sum + Number((it.price ?? 0)) * Number((it.qty ?? it.quantity ?? 1)), 0) : 0,
                status: o.status as any,
              }))}
              loading={loading}
              error={error}
              onUpdateStatus={(id: string, status: string) => updateOrderStatus(id, status)}
            />
          }
        />
      </Routes>
      </AdminLayout>
    </div>
  )
}

export default AppLocal