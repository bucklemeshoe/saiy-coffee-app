import { useAuth } from '@clerk/clerk-react'
import { useMemo } from 'react'
import { createSupabaseWithExternalAuth } from '@saiy/lib'

// Supports both Clerk-enabled and demo (no Clerk) modes.
export function useSupabase() {
  const clerkKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
  const isClerkDisabled = !clerkKey || clerkKey === 'disabled_for_local_dev'

  if (isClerkDisabled) {
    // No Clerk provider mounted; return a Supabase client without external JWT
    return useMemo(
      () => createSupabaseWithExternalAuth(async () => null),
      [],
    )
  }

  const { getToken } = useAuth()
  return useMemo(
    () => createSupabaseWithExternalAuth(() => getToken({ template: 'supabase' })),
    [getToken],
  )
}

