import { useState, useEffect } from 'react'
import { calculateDistance } from '@order-app/lib'

interface LocationMapProps {
  // Can be PostGIS WKT string ("POINT(lon lat)"), GeoJSON { type, coordinates }, or {x,y}/{lon,lat}
  customerLocation?: any
  orderId: string
}

// Coffee shop location (example - replace with actual coordinates)
const COFFEE_SHOP_LOCATION = {
  latitude: 37.7749,  // San Francisco example
  longitude: -122.4194
}

export function LocationMap({ customerLocation, orderId }: LocationMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if (!customerLocation) return

    let lat: number | null = null
    let lng: number | null = null

    // 1) WKT string: "POINT(lon lat)"
    if (typeof customerLocation === 'string') {
      const match = customerLocation.match(/POINT\(([^)]+)\)/)
      if (match) {
        const parts = match[1].trim().split(/\s+/)
        if (parts.length >= 2) {
          lng = Number(parts[0])
          lat = Number(parts[1])
        }
      }
    }

    // 2) GeoJSON: { type: 'Point', coordinates: [lng, lat] }
    if (!lat && customerLocation && typeof customerLocation === 'object' && 'coordinates' in customerLocation) {
      const coords = (customerLocation as any).coordinates
      if (Array.isArray(coords) && coords.length >= 2) {
        lng = Number(coords[0])
        lat = Number(coords[1])
      }
    }

    // 3) Plain object: { lat, lng } or { latitude, longitude }
    if (!lat && customerLocation && typeof customerLocation === 'object') {
      const maybeLat = (customerLocation as any).lat ?? (customerLocation as any).latitude
      const maybeLng = (customerLocation as any).lng ?? (customerLocation as any).longitude
      if (typeof maybeLat === 'number' && typeof maybeLng === 'number') {
        lat = maybeLat
        lng = maybeLng
      }
    }

    if (lat != null && lng != null) {
      setCoordinates({ lat, lng })
      const dist = calculateDistance(lat, lng, COFFEE_SHOP_LOCATION.latitude, COFFEE_SHOP_LOCATION.longitude)
      setDistance(dist)
    } else {
      setCoordinates(null)
      setDistance(null)
    }
  }, [customerLocation])

  if (!customerLocation || !coordinates) {
    return (
      <div className="text-sm text-gray-600">
        📍 Location not shared
      </div>
    )
  }

  const getDistanceColor = (distance: number) => {
    if (distance < 0.05) return 'text-green-600 dark:text-green-400' // < 50m
    if (distance < 0.5) return 'text-yellow-600 dark:text-yellow-400' // < 500m
    return 'text-gray-600 dark:text-gray-400' // > 500m
  }

  const getDistanceText = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`
    }
    return `${distance.toFixed(1)}km away`
  }

  const openInMaps = () => {
    const url = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    window.open(url, '_blank')
  }

  return (
    <div className="text-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Customer Location</span>
        <button
          onClick={openInMaps}
          className="text-blue-600 hover:underline"
        >
          View in Maps
        </button>
      </div>
      
      {distance !== null && (
        <div className={`font-medium ${getDistanceColor(distance)}`}>
          {getDistanceText(distance)}
          {distance < 0.05 && ''}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </div>
  )
}