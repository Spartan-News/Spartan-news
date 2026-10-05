import OneSignal from '@onesignal/capacitor-plugin';

export const initNotifications = async () => {
  try {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;

    if (window?.Capacitor?.isNativePlatform?.() && appId) {
      await OneSignal.initialize(appId);
      await OneSignal.Notifications.requestPermission(true);

      OneSignal.Notifications.addEventListener('click', (event) => {
        const notificationData = event.notification?.additionalData;
        if (notificationData?.videoId) {
          window.location.href = `https://shsnews.live/live?v=${notificationData.videoId}`;
        } else if (event.notification?.launchURL) {
          window.location.href = event.notification.launchURL;
        }
      });
    }
  } catch (err) {
    console.warn("OneSignal Capacitor initialization skipped or failed:", err);
  }
};

export const canPinToLockScreen = () => {
  return Boolean(window?.Capacitor?.isNativePlatform?.());
};

export const getPinnedIds = () => {
  try {
    const stored = localStorage.getItem('snn_pinned_games');
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Failed to fetch pinned game IDs:", err);
    return [];
  }
};

export const pinGame = async (game) => {
  try {
    const pinned = getPinnedIds();
    if (!pinned.includes(game.id)) {
      pinned.push(game.id);
      localStorage.setItem('snn_pinned_games', JSON.stringify(pinned));
    }
    if (game.id) {
      await startGameLiveActivity(game.id, game.spartanScore, game.opponentScore, game.clock);
    }
    return true;
  } catch (err) {
    console.error("Failed to pin game activity:", err);
    return false;
  }
};

export const pinGameToLockScreen = async (game) => {
  return await pinGame(game);
};

export const unpinGame = async (game) => {
  try {
    const pinned = getPinnedIds().filter(id => id !== game.id);
    localStorage.setItem('snn_pinned_games', JSON.stringify(pinned));
    return true;
  } catch (err) {
    console.error("Failed to unpin game activity:", err);
    return false;
  }
};

export const forgetPin = async (game) => {
  return await unpinGame(game);
};

export const getScoreAlertsEnabled = () => {
  try {
    const val = localStorage.getItem('snn_score_alerts_enabled');
    return val !== null ? JSON.parse(val) : true;
  } catch (err) {
    return true;
  }
};

export const setScoreAlerts = async (enabled) => {
  try {
    localStorage.setItem('snn_score_alerts_enabled', JSON.stringify(Boolean(enabled)));
    console.log(`Score alerts preference updated: ${enabled}`);
    return true;
  } catch (err) {
    console.error("Failed to update score alerts setting:", err);
    return false;
  }
};

export const startGameLiveActivity = async (activityId, homeScore, awayScore, clock) => {
  try {
    console.log(`Live Activity triggered for ${activityId}: ${homeScore} - ${awayScore} (${clock})`);
  } catch (err) {
    console.error("Failed to start Live Activity:", err);
  }
};