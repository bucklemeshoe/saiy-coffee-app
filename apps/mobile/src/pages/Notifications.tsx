import { IonContent, IonCard, IonCardContent, IonButton } from '@ionic/react'
import { useNotificationsStore } from '../store/notifications'

export default function NotificationsPage() {
  const notifications = useNotificationsStore((s) => s.notifications)
  const markAllSeen = useNotificationsStore((s) => s.markAllSeen)
  const clear = useNotificationsStore((s) => s.clear)

  return (
    <IonContent className="ion-padding">
      <div className="space-y-4 mt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <div className="flex gap-2">
            <IonButton color="medium" fill="outline" onClick={markAllSeen}>Mark all seen</IonButton>
            <IonButton color="danger" fill="outline" onClick={clear}>Clear</IonButton>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center text-gray-600 py-16">No notifications yet</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <IonCard key={n.id} className={n.seen ? '' : 'border border-amber-300'}>
                <IonCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{n.title}</h3>
                      <p className="text-gray-600 text-sm">{n.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('en-ZA')}</span>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </div>
    </IonContent>
  )
}

