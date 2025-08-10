import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppNotification = {
  id: string
  title: string
  message: string
  createdAt: string
  seen: boolean
}

type NotificationsState = {
  notifications: AppNotification[]
  unseenCount: number
  add: (n: Omit<AppNotification, 'id' | 'createdAt' | 'seen'> & { id?: string; createdAt?: string }) => void
  markAllSeen: () => void
  clear: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      unseenCount: 0,
      add: (n) =>
        set((state) => {
          const id = n.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
          const createdAt = n.createdAt ?? new Date().toISOString()
          const notification: AppNotification = { id, title: n.title, message: n.message, createdAt, seen: false }
          return {
            notifications: [notification, ...state.notifications].slice(0, 100),
            unseenCount: state.unseenCount + 1,
          }
        }),
      markAllSeen: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, seen: true })),
          unseenCount: 0,
        })),
      clear: () => set({ notifications: [], unseenCount: 0 }),
    }),
    { name: 'notifications' }
  )
)

