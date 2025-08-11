import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseWithExternalAuth(
  getClerkToken: () => Promise<string | null>,
): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL as string || 'http://localhost:54321'
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  if (!url || url === 'your_supabase_url_here') {
    throw new Error('Please set VITE_SUPABASE_URL in your .env file')
  }

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

  // Inject Clerk token per request using PostgREST "Authorization" header (optional for local)
  // Default ON unless explicitly set to 'false' to support Clerk in most environments
  const useExternalJwt = (import.meta as any).env?.VITE_SUPABASE_EXTERNAL_JWT !== 'false'
  if (useExternalJwt) {
    client.rest.fetch = async (input: RequestInfo, init?: RequestInit) => {
      const token = await getClerkToken()
      const headers = new Headers(init?.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(input as any, { ...init, headers })
    }

  }

  // Always try to set Realtime auth if a token is available so postgres_changes respects RLS
  const applyRealtimeAuth = async () => {
    try {
      const token = await getClerkToken()
      if (token) {
        // supabase-js v2: provide JWT for realtime socket
        // @ts-expect-error: typing for setAuth may not be exported in some versions
        client.realtime.setAuth(token)
      }
    } catch {
      // ignore
    }
  }
  // Initial apply and re-apply on window focus (token refresh)
  applyRealtimeAuth()
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', applyRealtimeAuth)
  }

  return client
}

