import { useState } from 'react'
import { LocationMap } from './LocationMap'

interface Order {
  id: string
  user_id: string
  items: any[]
  status: 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled'
  pickup_time: string
  share_location: boolean
  current_location?: string
  created_at: string
}

interface OrderCardProps {
  order: Order
  onStatusUpdate: (orderId: string, newStatus: string) => void
  compact?: boolean
}

export function OrderCard({ order, onStatusUpdate, compact = false }: OrderCardProps) {
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    if (updating) return
    setUpdating(true)
    try {
      await onStatusUpdate(order.id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'preparing':
        return 'bg-orange-50 text-orange-700 border border-orange-200'
      case 'ready':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'collected':
        return 'bg-gray-50 text-gray-700 border border-gray-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getNextActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { label: 'Start Preparing', status: 'preparing', color: 'bg-orange-600 hover:bg-orange-700' },
          { label: 'Cancel', status: 'cancelled', color: 'bg-red-600 hover:bg-red-700' }
        ]
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready', color: 'bg-green-600 hover:bg-green-700' },
          { label: 'Cancel', status: 'cancelled', color: 'bg-red-600 hover:bg-red-700' }
        ]
      case 'ready':
        return [
          { label: 'Mark Collected', status: 'collected', color: 'bg-gray-600 hover:bg-gray-700' }
        ]
      default:
        return []
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPickupTime = (timestamp: string) => {
    const pickupDate = new Date(timestamp)
    const now = new Date()
    const diffMs = pickupDate.getTime() - now.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))

    if (diffMins < 0) {
      return `${Math.abs(diffMins)}m ago`
    } else if (diffMins === 0) {
      return 'Now'
    } else {
      return `${diffMins}m`
    }
  }

  const nextActions = getNextActions(order.status)

  if (compact) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <div>
                <p className="font-medium text-zinc-900">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-zinc-600">
                {formatTime(order.created_at)} • {order.items.length} items
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="flex space-x-2">
            {nextActions.map((action) => (
              <button
                key={action.status}
                onClick={() => handleStatusUpdate(action.status)}
                disabled={updating}
                  className={`px-3 py-1 rounded text-sm text-white ${action.color} disabled:opacity-50`}
              >
                {updating ? '...' : action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-zinc-900">Order #{order.id.slice(0, 8)}</h4>
          <p className="text-sm text-zinc-600">
            {formatTime(order.created_at)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Pickup:</span> {formatPickupTime(order.pickup_time)}
        </div>
        
        {order.share_location && (
          <LocationMap 
            customerLocation={order.current_location} 
            orderId={order.id}
          />
        )}
        <div className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Items:</span>
        </div>
        <ul className="text-sm space-y-1">
          {order.items.map((item: any, index: number) => (
            <li key={index} className="flex justify-between text-zinc-700">
              <span className="text-zinc-900">{item.quantity}x {item.name}</span>
              <span className="font-medium text-zinc-900">${item.price}</span>
            </li>
          ))}
        </ul>
        <div className="pt-2 border-t border-zinc-200">
          <div className="flex justify-between font-medium">
            <span className="text-zinc-900">Total:</span>
            <span className="text-zinc-900">
              ${order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {nextActions.length > 0 && (
        <div className="flex space-x-2 pt-3">
          {nextActions.map((action) => (
            <button
              key={action.status}
              onClick={() => handleStatusUpdate(action.status)}
              disabled={updating}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium text-white ${action.color} disabled:opacity-50`}
            >
              {updating ? 'Updating...' : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}