import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Link, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <Link to="/" className="font-semibold">SAIY Admin</Link>
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
          <Route path="/" element={<div className="space-y-2">
            <h1 className="text-2xl font-bold">Orders Board</h1>
            <p>Admin scaffold with Tailwind + Clerk + Router.</p>
          </div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
