import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSupabase } from '../lib/useSupabase'
import { useCartStore } from '../store/cart'
import { locationToPostGIS } from '@saiy/lib'
import { LocationSharing } from '../components/LocationSharing'
import { IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonItem, IonLabel, IonNote, IonSpinner } from '@ionic/react'
import { checkmarkCircleOutline, alertCircleOutline, timeOutline, arrowBackOutline } from 'ionicons/icons'

function useDemoUserId(): string {
  return useMemo(() => {
    const key = 'demo_user_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }, [])
}

export default function CheckoutLocalPage() {
  const supabase = useSupabase()
  const demoUserId = useDemoUserId()
  const { items, clear } = useCartStore()
  const [pickupTime, setPickupTime] = useState<string>('ASAP')
  const [shareLocation, setShareLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Ensure demo user profile exists
    ;(async () => {
      await supabase
        .from('users')
        .upsert({ id: demoUserId, email: 'demo@example.com', name: 'Demo User' }, { onConflict: 'id' })
    })()
  }, [demoUserId, supabase])

  async function submitOrder() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      if (items.length === 0) throw new Error('Cart is empty')

      const orderData: any = {
        user_id: demoUserId,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        pickup_time:
          pickupTime === 'ASAP'
            ? new Date(Date.now() + 15 * 60000).toISOString()
            : new Date(pickupTime).toISOString(),
        share_location: shareLocation,
      }

      if (shareLocation && currentLocation) {
        orderData.current_location = locationToPostGIS(currentLocation.latitude, currentLocation.longitude)
      }

      const { data: order, error } = await supabase.from('orders').insert(orderData).select().single()
      if (error) throw new Error(error.message)

      setSuccess(`Order placed! ID: ${order.id.slice(0, 8)}...`)
      clear()
      setTimeout(() => {
        window.location.href = `/orders/${order.id}`
      }, 1200)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <IonContent className="ion-padding">
      <div className="space-y-6 mt-10">
        {/* Header */}
        <div className="space-y-3">
          <IonButton 
            routerLink="/cart"
            fill="clear"
            color="warning"
            size="small"
            aria-label="Back to Cart"
          >
            <IonIcon icon={arrowBackOutline} slot="start" />
            Back to Cart
          </IonButton>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your order details</p>
          </div>
        </div>

        {/* Order Summary */}
        <IonCard>
          <IonCardContent>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between items-center">
                  <span className="text-gray-900">{item.quantity}x {item.name}</span>
                  <span className="font-semibold text-gray-900">R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-amber-600">R{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Pickup Time */}
        <IonCard>
          <IonCardContent>
            <IonItem lines="none" className="--padding-start: 0">
              <IonIcon icon={timeOutline} color="warning" slot="start" />
              <IonLabel>
                <h3 className="text-lg font-semibold text-gray-900">Pickup Time</h3>
                <p className="text-gray-600">When would you like to collect your order?</p>
              </IonLabel>
            </IonItem>
            
            <IonSelect
              value={pickupTime}
              placeholder="Select pickup time"
              onSelectionChange={(e) => setPickupTime(e.detail.value)}
              className="mt-3"
            >
              <IonSelectOption value="ASAP">ASAP (15 minutes)</IonSelectOption>
              <IonSelectOption value={new Date(Date.now() + 15 * 60 * 1000).toISOString()}>In 15 minutes</IonSelectOption>
              <IonSelectOption value={new Date(Date.now() + 30 * 60 * 1000).toISOString()}>In 30 minutes</IonSelectOption>
            </IonSelect>
          </IonCardContent>
        </IonCard>

        {/* Location Sharing */}
        <IonCard>
          <IonCardContent>
            <LocationSharing
              onLocationChange={useCallback((enabled, loc) => {
                setShareLocation(enabled)
                setCurrentLocation(loc ?? null)
              }, [])}
              initialEnabled={shareLocation}
            />
          </IonCardContent>
        </IonCard>

        {/* Submit Button */}
        <div className="space-y-4">
          <IonButton
            expand="block"
            size="large"
            color="warning"
            onClick={submitOrder}
            disabled={submitting || items.length === 0}
          >
            {submitting ? (
              <>
                <IonSpinner name="crescent" />
                <span className="ml-2">Submitting Order...</span>
              </>
            ) : (
              <>
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                Place Order - R{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
              </>
            )}
          </IonButton>

          {items.length === 0 && (
            <IonNote className="text-center block">
              Your cart is empty. Add items from the menu to continue.
            </IonNote>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <IonCard color="danger">
            <IonCardContent>
              <div className="flex items-center space-x-2">
                <IonIcon icon={alertCircleOutline} color="light" />
                <span className="text-white font-medium">{error}</span>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Success Message */}
        {success && (
          <IonCard color="success">
            <IonCardContent>
              <div className="flex items-center space-x-2">
                <IonIcon icon={checkmarkCircleOutline} color="light" />
                <span className="text-white font-medium">{success}</span>
              </div>
            </IonCardContent>
          </IonCard>
        )}
      </div>
    </IonContent>
  )
}

