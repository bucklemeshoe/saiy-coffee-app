export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled'

export function getStatusBadgeColor(status: OrderStatus): 'warning' | 'primary' | 'success' | 'secondary' | 'danger' | 'medium' {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'preparing':
      return 'primary'
    case 'ready':
      return 'success'
    case 'collected':
      return 'secondary'
    case 'cancelled':
      return 'danger'
    default:
      return 'medium'
  }
}

export function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Order received - preparing to start'
    case 'preparing':
      return 'Your order is being prepared'
    case 'ready':
      return 'Ready for pickup! 🎉'
    case 'collected':
      return 'Order completed - enjoy!'
    case 'cancelled':
      return 'Order was cancelled'
    default:
      return ''
  }
}

export function isCurrentStatus(status: OrderStatus): boolean {
  return status === 'pending' || status === 'preparing' || status === 'ready'
}

export function isPastStatus(status: OrderStatus): boolean {
  return status === 'collected' || status === 'cancelled'
}

