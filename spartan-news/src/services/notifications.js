import OneSignal from '@onesignal/capacitor-plugin';

export async function initNotifications() {
  const ONESIGNAL_APP_ID = "8891bce2-807a-44dc-b4fb-595b3c893b82";

  if (window.Capacitor) {
    try {
      // 1. Initialize OneSignal
      await OneSignal.initialize(ONESIGNAL_APP_ID);

      // 2. Request notification permission
      await OneSignal.Notifications.requestPermission(true);

      // 3. Retrieve device subscription ID for verification
      const id = await OneSignal.User.getOnesignalId();
      console.log("OneSignal Device ID:", id);
    } catch (err) {
      console.error("OneSignal Init Error:", err);
    }
  }
}