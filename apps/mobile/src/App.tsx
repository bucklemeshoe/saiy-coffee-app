import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import { createSupabaseWithExternalAuth } from '@saiy/lib'
import MenuPage from './pages/Menu'
import CartPage from './pages/Cart'
import CheckoutPage from './pages/Checkout'

function App() {
  const { getToken } = useAuth()
  const supabase = useMemo(
    () => createSupabaseWithExternalAuth(() => getToken({ template: 'supabase' })),
    [getToken],
  )

  const [menu, setMenu] = useState<{ id: string; name: string; price: number }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link to="/" className="font-semibold">SAIY Coffee</Link>
        <nav className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="px-3 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      <main className="p-4">
        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Welcome</h1>
                <p>Mobile app scaffold with Tailwind + Clerk + Router.</p>
                <div className="space-y-2">
                  <button
                    onClick={loadMenu}
                    className="px-3 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    disabled={loading}
                  >
                    {loading ? 'Loading…' : 'Load menu'}
                  </button>
                  {error && <div className="text-red-600">{error}</div>}
                  {menu && (
                    <ul className="list-disc pl-5 space-y-1">
                      {menu.map((m) => (
                        <li key={m.id}>
                          {m.name} — {m.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            }
          />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
