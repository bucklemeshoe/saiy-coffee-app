import { useMemo, useState, useEffect } from 'react'
import { useRealtimeOrders } from '@order-app/lib'
import { useNotificationsStore } from '../store/notifications'
import { useSupabase } from '../lib/useSupabase'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonBadge, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react'
import { timeOutline, locationOutline } from 'ionicons/icons'
import { formatCurrency, formatDateTime } from '../utils/format'
import { getStatusBadgeColor as getStatusBadgeColorUtil, getStatusMessage as getStatusMessageUtil, isCurrentStatus, isPastStatus } from '../utils/status'

interface Order {
  id: string
  user_id: string
  items: any[]
  status: 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled'
  pickup_time: string
  share_location: boolean
  created_at: string
}

function OrdersPageDemo() {
  const supabase = useSupabase()
  const demoUserId = useMemo(() => {
    const key = 'demo_user_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }, [])

  const { orders, loading, lastEvent } = useRealtimeOrders(supabase, { userId: demoUserId })
  const addNotification = useNotificationsStore((s) => s.add)

  useEffect(() => {
    if (!lastEvent) return
    const { type, order } = lastEvent
    if (type === 'INSERT') {
      addNotification({ title: 'Order placed', message: `Order #${order.id.slice(0,8)} created` })
    } else if (type === 'UPDATE') {
      addNotification({ title: 'Order update', message: `Order #${order.id.slice(0,8)} is now ${order.status}` })
    }
  }, [lastEvent, addNotification])

  return <OrdersList loading={loading} orders={orders} />
}

function OrdersPageAuthed() {
  const supabase = useSupabase()
  const { user } = useUser()
  const { orders, loading, lastEvent } = useRealtimeOrders(supabase, { userId: user?.id })
  const addNotification = useNotificationsStore((s) => s.add)

  useEffect(() => {
    if (!lastEvent) return
    const { type, order } = lastEvent
    if (type === 'INSERT') {
      addNotification({ title: 'Order placed', message: `Order #${order.id.slice(0,8)} created` })
    } else if (type === 'UPDATE') {
      addNotification({ title: 'Order update', message: `Order #${order.id.slice(0,8)} is now ${order.status}` })
    }
  }, [lastEvent, addNotification])
  return <OrdersList loading={loading} orders={orders} />
}

export function OrdersPage() {
  const clerkKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
  const isClerkDisabled = !clerkKey || clerkKey === 'disabled_for_local_dev'
  return isClerkDisabled ? <OrdersPageDemo /> : <OrdersPageAuthed />
}

function OrdersList({ loading, orders }: { loading: boolean; orders: any[] }) {
  const [selectedTab, setSelectedTab] = useState<'current' | 'past'>('current')

  // Filter orders into current and past
  const currentOrders = orders.filter(order => isCurrentStatus(order.status))
  const pastOrders = orders.filter(order => isPastStatus(order.status))

  const displayedOrders = selectedTab === 'current' ? currentOrders : pastOrders

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'preparing': return 'text-orange-600 bg-orange-100'
      case 'ready': return 'text-green-600 bg-green-100'
      case 'collected': return 'text-gray-600 bg-gray-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusMessage = getStatusMessageUtil
  const getStatusBadgeColor = getStatusBadgeColorUtil

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <IonContent className="ion-padding">
        <div className="space-y-4 mt-10">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <div className="flex justify-center py-8">
            <IonSpinner name="crescent" color="warning" />
          </div>
        </div>
      </IonContent>
    )
  }

  return (
    <IonContent className="ion-padding">
      <div className="space-y-4 mt-10">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        
        {/* Segment Tabs */}
        <IonSegment 
          value={selectedTab} 
          onIonChange={(e) => setSelectedTab(e.detail.value as 'current' | 'past')}
          color="warning"
        >
          <IonSegmentButton value="current">
            <IonLabel>
              Current ({currentOrders.length})
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="past">
            <IonLabel>
              Past ({pastOrders.length})
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>
        
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">☕</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedTab === 'current' ? 'No current orders' : 'No past orders'}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'current' 
                ? 'Start by browsing our delicious menu!' 
                : 'Your completed and cancelled orders will appear here.'
              }
            </p>
            {selectedTab === 'current' && (
              <IonButton 
                routerLink="/menu"
                color="warning"
                fill="solid"
              >
                Browse Menu
              </IonButton>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map((order) => (
              <IonCard key={order.id} routerLink={`/orders/${order.id}`} button>
                <IonCardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <IonIcon icon={timeOutline} className="text-xs" />
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                     <IonBadge color={getStatusBadgeColor(order.status)}>
                      {order.status}
                    </IonBadge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {getStatusMessage(order.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(calculateTotal(order.items))}
                    </div>
                  </div>

                  {(order.status === 'ready' || order.status === 'preparing') && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      {order.status === 'ready' 
                        ? '🎉 Your order is ready for pickup!'
                        : '👨‍🍳 Your order is being prepared...'
                      }
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </div>
    </IonContent>
  )
}