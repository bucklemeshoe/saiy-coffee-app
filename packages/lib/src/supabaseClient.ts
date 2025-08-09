import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseWithExternalAuth(
  getClerkToken: () => Promise<string | null>,
): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const client = createClient(url, anonKey, {
    global: {
      headers: {
        apikey: anonKey,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  // Inject Clerk token per request using PostgREST "Authorization" header
  client.rest.fetch = async (input: RequestInfo, init?: RequestInit) => {
    const token = await getClerkToken()
    const headers = new Headers(init?.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return fetch(input as any, { ...init, headers })
  }

  return client
}

