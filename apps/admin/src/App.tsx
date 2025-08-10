import { SignInButton, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createSupabaseWithExternalAuth } from '@saiy/lib'
import AdminPage from './pages/AdminPage'
import { useRealtimeOrders } from '@saiy/lib'
import AdminLayout from './layout/AdminLayout'

function App() {
  const { getToken, isLoaded } = useAuth()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    if (isLoaded) {
      const client = createSupabaseWithExternalAuth(async () => {
        return await getToken({ template: 'supabase' })
      })
      setSupabase(client)
    }
  }, [getToken, isLoaded])

  const { orders, loading, error } = useRealtimeOrders(supabase)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error
      // Realtime subscription will update the UI
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status')
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-50 text-zinc-900">
      <Routes>
        <Route
          path="/*"
          element={
            <AdminLayout>
              <Routes>
                <Route
                  index
                  element={
                    <>
                      <SignedOut>
                        <div className="text-center py-12">
                          <h2 className="text-3xl font-bold mb-4">Admin Access Required</h2>
                          <p className="text-zinc-600 dark:text-zinc-400 mb-8">Please sign in to access the order management dashboard.</p>
                          <SignInButton>
                            <button className="px-6 py-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-lg">Sign In to Continue</button>
                          </SignInButton>
                        </div>
                      </SignedOut>
                      <SignedIn>
                        {supabase ? (
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
                        ) : (
                          <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
                          </div>
                        )}
                      </SignedIn>
                    </>
                  }
                />
                {/* Menu features removed */}
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </div>
  )
}

export default App
