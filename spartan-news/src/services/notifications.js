import OneSignal from '@onesignal/capacitor-plugin';

const ONESIGNAL_APP_ID = "8891bce2-807a-44dc-b4fb-595b3c893b82";

// 1. App initialization called by src/App.vue
export async function initNotifications() {
  if (window.Capacitor) {
    try {
      await OneSignal.initialize(ONESIGNAL_APP_ID);
      await OneSignal.Notifications.requestPermission(true);

      const id = await OneSignal.User.getOnesignalId();
      console.log("OneSignal Device ID:", id);
    } catch (err) {
      console.error("OneSignal Init Error:", err);
    }
  }
}

// 2. Start Live Activity Session
export async function startGameLiveActivity(activityId, homeScore, awayScore, gameClock) {
  if (window.Capacitor) {
    try {
      const attributes = {
        homeTeam: "Spartans",
        awayTeam: "Opponent"
      };
      const content = {
        homeScore: homeScore,
        awayScore: awayScore,
        gameClock: gameClock
      };

      await OneSignal.LiveActivities.startDefault(activityId, attributes, content);
      console.log("Live Activity Started:", activityId);
    } catch (err) {
      console.error("Live Activity Start Error:", err);
    }
  }
}

// 3. Update Live Activity Score
export async function updateGameLiveActivity(activityId, homeScore, awayScore, gameClock) {
  if (window.Capacitor) {
    try {
      const content = {
        homeScore: homeScore,
        awayScore: awayScore,
        gameClock: gameClock
      };
      await OneSignal.LiveActivities.enter(activityId, content);
    } catch (err) {
      console.error("Live Activity Update Error:", err);
    }
  }
}