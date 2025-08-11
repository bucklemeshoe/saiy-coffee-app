import { useState, useEffect } from 'react'
import { useRealtimeOrders } from '@order-app/lib'

interface OrderStatsProps {
  supabase: any
}

interface Stats {
  total: number
  pending: number
  preparing: number
  ready: number
  collected: number
  cancelled: number
}

export function OrderStats({ supabase }: OrderStatsProps) {
  // Use real-time orders hook
  const { orders, loading } = useRealtimeOrders(supabase)

  // Calculate stats from real-time orders data
  const stats: Stats = {
    total: orders.length,
    pending: 0,
    preparing: 0,
    ready: 0,
    collected: 0,
    cancelled: 0
  }

  orders.forEach((order) => {
    stats[order.status as keyof Omit<Stats, 'total'>]++
  })

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-zinc-50 rounded-xl p-4 animate-pulse border border-zinc-200">
            <div className="h-4 bg-zinc-200 rounded mb-2"></div>
            <div className="h-8 bg-zinc-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    { label: 'Total Orders', value: stats.total, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending', value: stats.pending, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Preparing', value: stats.preparing, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Ready', value: stats.ready, color: 'text-green-600 dark:text-green-400' },
    { label: 'Collected', value: stats.collected, color: 'text-gray-600 dark:text-gray-400' },
    { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600 dark:text-red-400' }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 md:p-5 shadow-sm">
          <div className="text-sm font-medium text-zinc-600">
            {stat.label}
          </div>
          <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}