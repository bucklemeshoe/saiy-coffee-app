import { useEffect, useMemo, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonSpinner, IonToast, IonIcon, IonNote } from '@ionic/react'
import { checkmarkCircleOutline } from 'ionicons/icons'
import { useSupabase } from '../lib/useSupabase'

type UserProfile = {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  dietary_prefs: string | null
}

export default function ProfilePage() {
  const supabase = useSupabase()
  const { user } = useUser()

  const clerkKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
  const isClerkDisabled = !clerkKey || clerkKey === 'disabled_for_local_dev'
  const { openUserProfile } = useClerk()

  const demoUserId = useMemo(() => {
    if (!isClerkDisabled) return null
    const key = 'demo_user_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }, [isClerkDisabled])

  const currentUserId = isClerkDisabled ? demoUserId! : (user?.id ?? '')
  const defaultEmail = isClerkDisabled ? 'demo@example.com' : (user?.primaryEmailAddress?.emailAddress ?? '')
  const defaultName = isClerkDisabled ? 'Demo User' : (user?.fullName ?? user?.firstName ?? '')

  const [profile, setProfile] = useState<UserProfile>({
    id: currentUserId,
    email: defaultEmail,
    name: defaultName,
    phone: '',
    dietary_prefs: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; message: string; color?: 'success' | 'danger' | 'warning' }>(
    { open: false, message: '', color: 'success' }
  )

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUserId)
          .maybeSingle()
        if (error) throw error
        if (isMounted) {
          if (data) {
            setProfile({
              id: data.id,
              email: data.email,
              name: data.name,
              phone: data.phone,
              dietary_prefs: data.dietary_prefs,
            })
          } else {
            // Pre-fill from auth defaults if no profile yet
            setProfile((p) => ({ ...p, email: defaultEmail, name: defaultName }))
          }
        }
      } catch (e: any) {
        setToast({ open: true, message: e?.message ?? 'Failed to load profile', color: 'danger' })
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => { isMounted = false }
  }, [supabase, currentUserId, defaultEmail, defaultName])

  const handleSave = async () => {
    try {
      setSaving(true)
      setToast({ open: false, message: '' })
      const payload = {
        id: currentUserId,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        dietary_prefs: profile.dietary_prefs,
      }
      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'id' })
      if (error) throw error
      setToast({ open: true, message: 'Profile saved', color: 'success' })
    } catch (e: any) {
      setToast({ open: true, message: e?.message ?? 'Failed to save profile', color: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <IonContent className="ion-padding">
        <div className="space-y-6 mt-10 text-center">
          <IonSpinner name="crescent" color="warning" />
          <h1 className="text-2xl font-bold text-gray-900">Loading Profile…</h1>
        </div>
      </IonContent>
    )
  }

  return (
    <IonContent className="ion-padding">
      <div className="space-y-6 mt-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your contact details and preferences</p>
        </div>

        <IonCard>
          <IonCardContent>
            <div className="space-y-4">
              <IonItem lines="full">
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={profile.email ?? ''}
                  onIonInput={(e) => setProfile((p) => ({ ...p, email: e.detail.value ?? '' }))}
                  placeholder="you@example.com"
                  readonly={!!clerkKey && !isClerkDisabled}
                  disabled={!!clerkKey && !isClerkDisabled}
                />
                {!!clerkKey && !isClerkDisabled && (
                  <IonNote color="medium">Managed by your account (Clerk)</IonNote>
                )}
              </IonItem>

              <IonItem lines="full">
                <IonLabel position="stacked">Full name</IonLabel>
                <IonInput
                  value={profile.name ?? ''}
                  onIonInput={(e) => setProfile((p) => ({ ...p, name: e.detail.value ?? '' }))}
                  placeholder="e.g. Alex Coffee"
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel position="stacked">Phone</IonLabel>
                <IonInput
                  type="tel"
                  value={profile.phone ?? ''}
                  onIonInput={(e) => setProfile((p) => ({ ...p, phone: e.detail.value ?? '' }))}
                  placeholder="e.g. 071 234 5678"
                />
              </IonItem>

              <IonItem lines="full">
                <IonLabel position="stacked">Dietary preferences</IonLabel>
                <IonTextarea
                  value={profile.dietary_prefs ?? ''}
                  onIonInput={(e) => setProfile((p) => ({ ...p, dietary_prefs: e.detail.value ?? '' }))}
                  autoGrow
                  placeholder="e.g. Oat milk, no sugar"
                />
              </IonItem>

              <div className="pt-2">
                <IonButton expand="block" color="warning" size="large" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <IonSpinner name="crescent" />
                      <span className="ml-2">Saving…</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Save Profile
                    </>
                  )}
                </IonButton>
                {!!clerkKey && !isClerkDisabled && (
                  <div className="pt-3">
                    <IonButton expand="block" fill="outline" color="medium" onClick={() => openUserProfile?.()}>
                      Manage Account (Clerk)
                    </IonButton>
                  </div>
                )}
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={toast.open}
          onDidDismiss={() => setToast((t) => ({ ...t, open: false }))}
          message={toast.message}
          duration={2000}
          color={toast.color}
          position="top"
        />
      </div>
    </IonContent>
  )
}

