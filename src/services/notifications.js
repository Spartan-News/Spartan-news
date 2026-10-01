import OneSignal from '@onesignal/capacitor-plugin';

export const initNotifications = async () => {
  try {
    // Initialize OneSignal with your App ID
    await OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");

    // Request notification permissions
    await OneSignal.Notifications.requestPermission(true);

    // Add listener for notification clicks to navigate directly to stream page
    OneSignal.Notifications.addEventListener('click', (event) => {
      const notificationData = event.notification.additionalData;
      if (notificationData && notificationData.videoId) {
        window.location.href = `https://shsnews.live/live?v=${notificationData.videoId}`;
      } else if (event.notification.launchURL) {
        window.location.href = event.notification.launchURL;
      }
    });
  } catch (err) {
    console.warn("OneSignal initialization skipped or failed:", err);
  }
};

export const startGameLiveActivity = async (activityId, homeScore, awayScore, clock) => {
  try {
    console.log(`Live Activity triggered for ${activityId}: ${homeScore} - ${awayScore} (${clock})`);
  } catch (err) {
    console.error("Failed to start Live Activity:", err);
  }
};