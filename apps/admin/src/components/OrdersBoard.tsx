import { useState, useEffect } from 'react'
import { OrderCard } from './OrderCard'
import { useRealtimeOrders } from '@order-app/lib'
// TODO: Replace with Shadcn badge/status component

interface Order {
  id: string
  user_id: string
  items: any[]
  status: 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled'
  pickup_time: string
  share_location: boolean
  created_at: string
}

interface OrdersBoardProps {
  supabase: any
}

export function OrdersBoard({ supabase }: OrdersBoardProps) {
  const [filter, setFilter] = useState<string>('active') // 'all', 'active', 'completed'
  
  // Use real-time orders hook
  const { orders: allOrders, loading, error } = useRealtimeOrders(supabase)
  const [orders, setOrders] = useState<Order[]>([])

  // Keep a local copy so we can do optimistic updates
  useEffect(() => {
    setOrders(allOrders)
  }, [allOrders])

  // Filter orders based on current filter
  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return ['pending', 'preparing', 'ready'].includes(order.status)
    } else if (filter === 'completed') {
      return ['collected', 'cancelled'].includes(order.status)
    }
    return true // 'all' filter
  })

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic UI update
      let previousStatus: string | null = null
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            previousStatus = o.status
            return { ...o, status: newStatus as any }
          }
          return o
        }),
      )

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Realtime will confirm; nothing else needed

      // TODO: Add order event tracking
      // await supabase.from('order_events').insert({
      //   order_id: orderId,
      //   actor: 'admin',
      //   event: `status_changed_to_${newStatus}`,
      //   metadata: { previous_status: currentStatus }
      // })

    } catch (error) {
      console.error('Error updating order:', error)
      // Roll back optimistic change
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId && previousStatus ? { ...o, status: previousStatus as any } : o)),
      )
      alert('Failed to update order status')
    }
  }

  // No need for manual polling anymore - real-time subscriptions handle updates!
  // useEffect removed - orders are now managed by useRealtimeOrders hook

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter(order => order.status === status)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-zinc-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-zinc-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-100 rounded-lg p-4 animate-pulse h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Orders Board</h2>
          <RealtimeIndicator isConnected={!loading && !error} />
        </div>
        {/* Segmented filter */}
        <div className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
          {[
            { key: 'active', label: 'Active Orders' },
            { key: 'completed', label: 'Completed' },
            { key: 'all', label: 'All Orders' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-600 flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Pending ({getOrdersByStatus('pending').length})
            </h3>
            <div className="space-y-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3 md:p-4">
              {getOrdersByStatus('pending').map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={updateOrderStatus}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-600 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Preparing ({getOrdersByStatus('preparing').length})
            </h3>
            <div className="space-y-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3 md:p-4">
              {getOrdersByStatus('preparing').map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={updateOrderStatus}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Ready ({getOrdersByStatus('ready').length})
            </h3>
            <div className="space-y-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3 md:p-4">
              {getOrdersByStatus('ready').map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={updateOrderStatus}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {(filter === 'completed' || filter === 'all') && (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusUpdate={updateOrderStatus}
              compact={true}
            />
          ))}
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No orders found for the selected filter.
          </p>
        </div>
      )}
    </div>
  )
}