import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

interface Order {
  id: string
  user_id: string
  items: any[]
  status: 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled'
  pickup_time: string
  share_location: boolean
  current_location?: any
  created_at: string
}

interface UseRealtimeOrdersOptions {
  userId?: string // For filtering user's orders
  initialFetch?: boolean
}

export function useRealtimeOrders(
  supabase: SupabaseClient | null,
  options: UseRealtimeOrdersOptions = {}
) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastEvent, setLastEvent] = useState<{ type: 'INSERT' | 'UPDATE' | 'DELETE'; order: Order } | null>(null)

  const { userId, initialFetch = true } = options

  // Fetch initial orders
  const fetchOrders = async () => {
    if (!supabase) return

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter by user if specified
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!supabase) return

    if (initialFetch) {
      fetchOrders()
    } else {
      setLoading(false)
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Real-time order change:', payload)

      switch (payload.eventType) {
            case 'INSERT':
              // Add new order
              const newOrder = payload.new as Order
              // Only add if it matches our filter (if any)
              if (!userId || newOrder.user_id === userId) {
                setOrders(prev => [newOrder, ...prev])
            setLastEvent({ type: 'INSERT', order: newOrder })
              }
              break

            case 'UPDATE':
              // Update existing order
              const updatedOrder = payload.new as Order
              setOrders(prev => prev.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              ))
          setLastEvent({ type: 'UPDATE', order: updatedOrder })
              break

            case 'DELETE':
              // Remove deleted order
              const deletedId = payload.old.id
              setOrders(prev => prev.filter(order => order.id !== deletedId))
          setLastEvent({ type: 'DELETE', order: payload.old as Order })
              break
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, initialFetch])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    lastEvent
  }
}

// Hook for a single order with real-time updates
export function useRealtimeOrder(
  supabase: SupabaseClient | null,
  orderId: string | undefined,
  userId?: string
) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial order
  const fetchOrder = async () => {
    if (!supabase || !orderId) return

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)

      // Filter by user if specified (for security)
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.single()

      if (error) throw error
      setOrder(data)
    } catch (err: any) {
      console.error('Error fetching order:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!supabase || !orderId) return

    fetchOrder()

    // Set up real-time subscription for this specific order
    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Real-time order update:', payload)
          const updatedOrder = payload.new as Order
          
          // Security check: only update if user matches (if userId provided)
          if (!userId || updatedOrder.user_id === userId) {
            setOrder(updatedOrder)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, orderId, userId])

  return {
    order,
    loading,
    error,
    refetch: fetchOrder
  }
}