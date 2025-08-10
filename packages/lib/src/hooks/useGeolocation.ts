import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

interface UseGeolocationReturn {
  location: LocationData | null
  error: string | null
  loading: boolean
  requestLocation: () => void
  clearLocation: () => void
  isSupported: boolean
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false
  } = options

  const isSupported = 'geolocation' in navigator

  const handleSuccess = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    })
    setError(null)
    setLoading(false)
  }

  const handleError = (error: GeolocationPositionError) => {
    let errorMessage = 'Unknown location error'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out'
        break
    }
    
    setError(errorMessage)
    setLoading(false)
  }

  const requestLocation = () => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    }

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
      
      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
    }
  }

  const clearLocation = () => {
    setLocation(null)
    setError(null)
    setLoading(false)
  }

  return {
    location,
    error,
    loading,
    requestLocation,
    clearLocation,
    isSupported
  }
}

// Utility function to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

// Convert location to PostGIS format for Supabase
export function locationToPostGIS(latitude: number, longitude: number): string {
  return `POINT(${longitude} ${latitude})`
}