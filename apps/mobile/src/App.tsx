import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { IonApp, IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonMenuButton, setupIonicReact } from '@ionic/react'
import { useAuth } from '@clerk/clerk-react'
import { useMemo, useState } from 'react'
import { createSupabaseWithExternalAuth } from '@saiy/lib'
import MenuPage from './pages/Menu'
import CartPage from './pages/Cart'
import CheckoutPage from './pages/Checkout'
import { OrdersPage } from './pages/Orders'
import { OrderDetailsPage } from './pages/OrderDetails'
import ProfilePage from './pages/Profile'
 
import { useCartStore } from './store/cart'
import { cartOutline, homeOutline, receiptOutline, restaurantOutline, menuOutline, personOutline } from 'ionicons/icons'

// Initialize Ionic React
setupIonicReact()

function App() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const supabase = useMemo(
    () => createSupabaseWithExternalAuth(() => getToken({ template: 'supabase' })),
    [getToken],
  )

  const [menu, setMenu] = useState<{ id: string; name: string; price: number }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { items: cartItems } = useCartStore()
  

  async function loadMenu() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id,name,price')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setMenu(data ?? [])
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
              <SignedOut>
                <SignInButton>
                  <IonButton fill="solid" size="small" color="light">
                    Sign in
                  </IonButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="mr-2">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full ring-2 ring-white"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        {/* Ionic Tabs */}
        <IonTabs>
          <IonRouterOutlet>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="p-4 space-y-8">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                        <span className="text-white text-4xl">☕</span>
                      </div>
                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          Welcome to SAIY Coffee
                        </h1>
                        <p className="text-gray-600 text-lg">
                          Freshly brewed, perfectly crafted
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group bg-white rounded-2xl p-6 shadow-md border border-amber-100">
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mx-auto flex items-center justify-center">
                            <span className="text-white text-2xl">🍽️</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Browse Menu</h3>
                            <p className="text-sm text-gray-600">Explore our coffee selection</p>
                          </div>
                        </div>
                      </div>

                      <SignedIn>
                        <div className="group bg-white rounded-2xl p-6 shadow-md border border-amber-100">
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mx-auto flex items-center justify-center">
                              <span className="text-white text-2xl">📋</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">My Orders</h3>
                              <p className="text-sm text-gray-600">Track your orders</p>
                            </div>
                          </div>
                        </div>
                      </SignedIn>
                    </div>
                  </div>
                }
              />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={
                <SignedIn>
                  <OrdersPage />
                </SignedIn>
              } />
              <Route path="/orders/:orderId" element={
                <SignedIn>
                  <OrderDetailsPage />
                </SignedIn>
              } />
              
              <Route path="/profile" element={
                <SignedIn>
                  <ProfilePage />
                </SignedIn>
              } />
            </Routes>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="menu" href="/menu">
              <IonIcon icon={restaurantOutline} />
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
            <SignedIn>
              <IonTabButton tab="orders" href="/orders">
                <IonIcon icon={receiptOutline} />
                <IonLabel>Orders</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/profile">
                <IonIcon icon={personOutline} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </SignedIn>
          </IonTabBar>
        </IonTabs>
        
      </IonPage>
    </IonApp>
  )
}

export default App
