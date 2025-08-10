import { useState, useEffect } from 'react'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonCheckbox, IonLabel, IonTextarea } from '@ionic/react'
import { arrowBackOutline, addOutline, removeOutline, checkmarkOutline } from 'ionicons/icons'
import { formatCurrency } from '../utils/format'

type Product = {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
}

export type ExtraOption = {
  id: string
  name: string
  price: number
}

interface ProductDetailModalProps {
  isOpen: boolean
  product: Product | null
  adding?: boolean
  onDismiss: () => void
  onAdd: (quantity: number, extras: ExtraOption[], instructions: string) => void | Promise<void>
  extras?: ExtraOption[]
}

export default function ProductDetailModal({ isOpen, product, adding, onDismiss, onAdd, extras }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([])
  const [instructions, setInstructions] = useState('')

  const defaultExtras: ExtraOption[] = [
    { id: 'extra_shot', name: 'Extra shot', price: 5 },
    { id: 'oat_milk', name: 'Oat milk', price: 6 },
    { id: 'caramel', name: 'Caramel syrup', price: 4 },
    { id: 'large', name: 'Large size', price: 10 },
  ]

  const effectiveExtras = extras && extras.length > 0 ? extras : defaultExtras
  const extrasUnitTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0)
  const perUnitTotal = (product?.price ?? 0) + extrasUnitTotal
  const totalPrice = perUnitTotal * quantity

  useEffect(() => {
    if (isOpen) setQuantity(1)
  }, [isOpen])

  const toggleExtra = (extra: ExtraOption, checked: boolean) => {
    setSelectedExtras((prev) => {
      if (checked) {
        if (prev.find((e) => e.id === extra.id)) return prev
        return [...prev, extra]
      }
      return prev.filter((e) => e.id !== extra.id)
    })
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar color="warning">
          <IonButtons slot="start">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{product?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
            {product && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-6xl">☕</span>
                )}
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
              )}
              <div className="text-4xl font-bold text-amber-600">{formatCurrency(product.price)}</div>
            </div>

            {/* Extras */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">Extras</h3>
              <IonList>
                {effectiveExtras.map((extra) => {
                  const checked = !!selectedExtras.find((e) => e.id === extra.id)
                  return (
                    <IonItem key={extra.id} lines="full">
                      <IonCheckbox
                        checked={checked}
                        onIonChange={(e) => toggleExtra(extra, !!e.detail.checked)}
                        slot="start"
                      />
                      <IonLabel>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-900">{extra.name}</span>
                          <span className="text-amber-600 font-medium">{formatCurrency(extra.price)}</span>
                        </div>
                      </IonLabel>
                    </IonItem>
                  )
                })}
              </IonList>
              {selectedExtras.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected extras: {selectedExtras.map((e) => e.name).join(', ')} (+{formatCurrency(extrasUnitTotal)} per item)
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 text-center">Quantity</h3>
              <div className="flex items-center justify-center gap-4">
                <IonButton onClick={() => setQuantity(Math.max(1, quantity - 1))} fill="outline" color="warning" disabled={quantity <= 1}>
                  <IonIcon icon={removeOutline} />
                </IonButton>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                <IonButton onClick={() => setQuantity(quantity + 1)} fill="outline" color="warning">
                  <IonIcon icon={addOutline} />
                </IonButton>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Instructions</h3>
              <IonTextarea
                value={instructions}
                onIonInput={(e) => setInstructions(e.detail.value ?? '')}
                autoGrow
                placeholder="e.g. Oat milk, less ice, light sugar"
              />
            </div>

            <div className="space-y-3">
              <IonButton
                expand="block"
                size="large"
                color="warning"
                onClick={() => onAdd(quantity, selectedExtras, instructions)}
                disabled={adding}
              >
                {adding ? (
                  <>
                    <IonIcon icon={checkmarkOutline} slot="start" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <IonIcon icon={addOutline} slot="start" />
                    Add {quantity}x to Cart - {formatCurrency(totalPrice)}
                  </>
                )}
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}

