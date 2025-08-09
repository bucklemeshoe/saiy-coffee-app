import { useAuth } from '@clerk/clerk-react'
import { useMemo } from 'react'
import { createSupabaseWithExternalAuth } from '@saiy/lib'

export function useSupabase() {
  const { getToken } = useAuth()
  return useMemo(
    () => createSupabaseWithExternalAuth(() => getToken({ template: 'supabase' })),
    [getToken],
  )
}

