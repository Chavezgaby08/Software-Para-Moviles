import { LocalNotifications } from '@capacitor/local-notifications';

export const useLocalNotifications = () => {
  const requestPermission = async () => {
    await LocalNotifications.requestPermissions();
  };

  const sendNotification = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: new Date(Date.now() + 100) }
          }
        ]
      });
    } catch (e) {
      console.error("Error al enviar notificación local:", e);
    }
  };

  return { requestPermission, sendNotification };
};