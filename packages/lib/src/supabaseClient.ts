import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseWithExternalAuth(
  getClerkToken: () => Promise<string | null>,
): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  return createClient(url, anonKey, {
    global: {
      fetch: async (input, init) => {
        const token = await getClerkToken()
        const headers = new Headers(init?.headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(input, { ...init, headers })
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

