import { useState, useEffect } from 'react'

interface RealtimeIndicatorProps {
  isConnected: boolean
  lastUpdate?: Date
}

export function RealtimeIndicator({ isConnected, lastUpdate }: RealtimeIndicatorProps) {
  const [showPulse, setShowPulse] = useState(false)

  // Show pulse animation when there's an update
  useEffect(() => {
    if (lastUpdate) {
      setShowPulse(true)
      const timeout = setTimeout(() => setShowPulse(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [lastUpdate])

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
        isConnected 
          ? showPulse 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-green-500'
          : 'bg-red-500'
      }`} />
      <span>
        {isConnected ? 'Live updates' : 'Disconnected'}
        {showPulse && ' • Updated'}
      </span>
    </div>
  )
}