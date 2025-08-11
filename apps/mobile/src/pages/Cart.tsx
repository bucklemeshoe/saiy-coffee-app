import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cart'
// Using Ionic + native elements
import { IonContent, IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/react'
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons'

export default function CartPage() {
  const { items, add, remove, updateQty, clear } = useCartStore()
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleIncrement = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      add({ ...item, quantity: 1 })
    }
  }

  const handleDecrement = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      if (item.quantity > 1) {
        updateQty(id, item.quantity - 1)
      } else {
        remove(id) // Remove item only when quantity would go to 0
      }
    }
  }

  const handleRemoveAll = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        remove(id)
      }
    }
  }

  if (items.length === 0) {
    return (
      <IonContent className="ion-padding">
        <div className="py-16 text-center space-y-6 mt-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
            <span className="text-4xl">🛒</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600">
              Browse our delicious menu and add some items to get started!
            </p>
          </div>
          <IonButton 
            routerLink="/menu"
            color="warning"
            fill="solid"
            size="large"
          >
            Browse Menu
          </IonButton>
        </div>
      </IonContent>
    )
  }

  return (
    <IonContent className="ion-padding">
      <div className="space-y-6 mt-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <IonButton
              onClick={clear}
              color="danger"
              fill="outline"
              size="small"
              aria-label="Clear all items from cart"
            >
              <IonIcon icon={trashOutline} slot="start" />
              Clear All
            </IonButton>
          )}
        </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <IonCard key={`${item.id}-${index}`}>
            <IonCardContent>
              <div className="flex items-center gap-4">
                {/* Item Icon */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                  <span className="text-2xl">☕</span>
                </div>

                {/* Item Details */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-amber-600 font-medium">
                    R{item.price.toFixed(2)} each
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Total: R{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <IonButton
                      onClick={() => handleDecrement(item.id)}
                      fill="clear"
                      size="small"
                      color="medium"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <IonIcon icon={removeOutline} />
                    </IonButton>
                    <span className="px-3 py-1 font-medium text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <IonButton
                      onClick={() => handleIncrement(item.id)}
                      fill="clear"
                      size="small"
                      color="medium"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <IonIcon icon={addOutline} />
                    </IonButton>
                  </div>

                  {/* Remove Button */}
                  <IonButton
                    onClick={() => handleRemoveAll(item.id)}
                    color="danger"
                    fill="clear"
                    size="small"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </div>

      {/* Order Summary */}
      <IonCard className="bg-gradient-to-r from-amber-50 to-orange-50">
        <IonCardContent>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8.5%)</span>
              <span>R{(subtotal * 0.085).toFixed(2)}</span>
            </div>
            <div className="border-t border-amber-200 pt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>R{(subtotal * 1.085).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <IonButton 
              routerLink="/checkout"
              expand="block"
              color="warning"
              fill="solid"
            >
              Proceed to Checkout
            </IonButton>
            
            <IonButton 
              routerLink="/menu"
              expand="block"
              color="warning"
              fill="outline"
            >
              Add More Items
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
      </div>
    </IonContent>
  )
}