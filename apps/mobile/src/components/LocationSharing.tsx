import { useState, useEffect } from 'react'
import { useGeolocation, locationToPostGIS } from '@saiy/lib'

interface LocationSharingProps {
  onLocationChange: (enabled: boolean, location?: { latitude: number; longitude: number }) => void
  initialEnabled?: boolean
}

export function LocationSharing({ onLocationChange, initialEnabled = false }: LocationSharingProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const { location, error, loading, requestLocation, clearLocation, isSupported } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000
  })

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    
    if (checked && isSupported) {
      requestLocation()
    } else {
      clearLocation()
      onLocationChange(false)
    }
  }

  // Notify parent when location changes
  useEffect(() => {
    if (enabled && location) {
      onLocationChange(true, {
        latitude: location.latitude,
        longitude: location.longitude
      })
    } else if (!enabled) {
      onLocationChange(false)
    }
  }, [enabled, location, onLocationChange])

  if (!isSupported) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          📍 Location sharing is not supported by your browser
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            📍 Share Location
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help us notify you when you're nearby for pickup
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-2">
          {loading && (
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Getting your location...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              ⚠️ {error}
              <button
                onClick={() => requestLocation()}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {location && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✅ Location shared (accurate to ~{Math.round(location.accuracy)}m)
            </div>
          )}
        </div>
      )}

      {enabled && !loading && !error && !location && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => requestLocation()}
            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Enable location sharing
          </button>
        </div>
      )}
    </div>
  )
}