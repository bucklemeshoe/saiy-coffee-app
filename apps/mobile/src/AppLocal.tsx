import { Link, Route, Routes, Navigate } from 'react-router-dom'
import { IonApp, IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonMenuButton, setupIonicReact } from '@ionic/react'
import { useMemo, useState } from 'react'
import { createSupabaseWithExternalAuth } from '@order-app/lib'
import MenuPage from './pages/Menu'
import CartPage from './pages/Cart'
import CheckoutPage from './pages/Checkout'
import CheckoutLocal from './pages/CheckoutLocal'
import { OrdersPage } from './pages/Orders'
import { OrderDetailsPage } from './pages/OrderDetails'
import ProfileLocalPage from './pages/ProfileLocal'
 
import { useCartStore } from './store/cart'
import { Button } from 'order-app-ui'
import { Avatar } from 'order-app-ui'
import { Badge } from 'order-app-ui'
import { Navbar, NavbarSection, NavbarSpacer } from 'order-app-ui'
import { BeakerIcon, HomeIcon, ShoppingCartIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { cartOutline, homeOutline, receiptOutline, menuOutline, personOutline } from 'ionicons/icons'

// Local development version without Clerk authentication
setupIonicReact()

function AppLocal() {
  // Mock auth for local development
  const mockAuth = {
    getToken: () => Promise.resolve(null)
  }
  
  const supabase = useMemo(
    () => createSupabaseWithExternalAuth(() => mockAuth.getToken()),
    []
  )
  

  const [menu, setMenu] = useState<{ id: string; name: string; price: number }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { items: cartItems } = useCartStore()
  

  const loadMenu = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('menu_items').select('id,name,price').eq('is_active', true)
      if (error) throw error
      setMenu(data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonApp>
    <IonPage>
      {/* Ionic Header */}
      <IonHeader>
        <IonToolbar color="warning">
          <IonButtons slot="start">
            <IonMenuButton aria-label="Open menu">
              <IonIcon icon={menuOutline} />
            </IonMenuButton>
            <span className="ml-3 text-lg font-semibold text-white">Coffee App</span>
          </IonButtons>
          
          <IonButtons slot="end">
            
            <Badge color="blue" className="text-xs mr-2">Demo</Badge>
            <Avatar src="/api/placeholder/32/32" className="size-8 mr-2" square={false} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* Ionic Tabs (RouterOutlet must be a direct child) */}
      <IonTabs>
        <IonRouterOutlet>
          <Routes>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutLocal />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/profile" element={<ProfileLocalPage />} />
            
            <Route path="/" element={<Navigate to="/menu" replace />} />
          </Routes>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="menu" href="/menu">
            <IonIcon icon={homeOutline} />
            <IonLabel>Menu</IonLabel>
          </IonTabButton>
          <IonTabButton tab="cart" href="/cart">
            <IonIcon icon={cartOutline} />
            <IonLabel>Cart</IonLabel>
            {cartItems.length > 0 && (
              <span className="absolute right-3 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </IonTabButton>
          <IonTabButton tab="orders" href="/orders">
            <IonIcon icon={receiptOutline} />
            <IonLabel>Orders</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
      
    </IonPage>
    </IonApp>
  )
}

export default AppLocal