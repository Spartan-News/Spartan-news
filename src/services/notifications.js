import OneSignal from '@onesignal/capacitor-plugin';

let oneSignalInitPromise;

export const initNotifications = () => {
  if (!oneSignalInitPromise) oneSignalInitPromise = initializeOneSignal();
  return oneSignalInitPromise;
};

const initializeOneSignal = async () => {
  try {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;

    if (window?.Capacitor?.isNativePlatform?.() && appId) {
      await OneSignal.initialize(appId);
      if (window.Capacitor.getPlatform?.() === 'ios') {
        await OneSignal.LiveActivities.setupDefault();
      }
      await OneSignal.Notifications.requestPermission(true);

      OneSignal.Notifications.addEventListener('click', (event) => {
        const notificationData = event.notification?.additionalData;
        if (notificationData?.videoId) {
          const path = notificationData.type === 'youtube-upload' ? '/' : '/live';
          window.location.href = `https://shsnews.live${path}?v=${encodeURIComponent(notificationData.videoId)}`;
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
  const previouslyPinned = getPinnedIds();
  try {
    const pinned = previouslyPinned;
    if (!pinned.includes(game.id)) {
      pinned.push(game.id);
      localStorage.setItem('snn_pinned_games', JSON.stringify(pinned));
    }
    if (game.id) {
      await startGameLiveActivity(game.id, game.spartanScore, game.opponentScore, game.clock, game);
    }
    return true;
  } catch (err) {
    localStorage.setItem('snn_pinned_games', JSON.stringify(previouslyPinned.filter(id => id !== game.id)));
    console.error("Failed to pin game activity:", err);
    throw err;
  }
};

export const pinGameToLockScreen = async (game) => {
  return await pinGame(game);
};

export const unpinGame = async (game) => {
  try {
    const pinned = getPinnedIds().filter(id => id !== game.id);
    localStorage.setItem('snn_pinned_games', JSON.stringify(pinned));
    await stopGameLiveActivity(game);
    return true;
  } catch (err) {
    console.error("Failed to unpin game activity:", err);
    return false;
  }
};

export const forgetPin = async (game) => {
  const gameId = typeof game === 'string' ? game : game?.id;
  if (!gameId) return false;
  localStorage.setItem('snn_pinned_games', JSON.stringify(getPinnedIds().filter(id => id !== gameId)));
  return true;
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

export const startGameLiveActivity = async (activityId, homeScore, awayScore, clock, game = {}) => {
  try {
    if (!window?.Capacitor?.isNativePlatform?.()) return false;
    await initNotifications();

    const title = `${game.sport || 'Spartan'} vs. ${game.opponent || 'Opponent'}`;
    const content = {
      spartanScore: Number(homeScore) || 0,
      opponentScore: Number(awayScore) || 0,
      clock: clock || 'LIVE',
      message: { en: `Spartans ${homeScore || 0}, ${game.opponent || 'Opponent'} ${awayScore || 0} · ${clock || 'LIVE'}` },
    };

    if (window.Capacitor.getPlatform?.() === 'ios') {
      await OneSignal.LiveActivities.startDefault(`sparta_${activityId}`, { title }, content);
      return true;
    }

    const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
    if (!subscriptionId) throw new Error('Push notifications are not ready on this device yet.');
    const response = await fetch(`${import.meta.env.VITE_WORKER_URL || 'https://noti.router.app.shsnews.live'}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: activityId, subscriptionId }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Could not start the Android Live Update.');
    return true;
  } catch (err) {
    console.error("Failed to start Live Activity:", err);
    throw err;
  }
};

const stopGameLiveActivity = async (game) => {
  if (!window?.Capacitor?.isNativePlatform?.()) return;
  if (window.Capacitor.getPlatform?.() === 'ios') {
    // OneSignal does not expose an end method for its default ActivityKit type;
    // the server sends the authoritative end when the game reaches FINAL.
    return;
  }
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return;
  await fetch(`${import.meta.env.VITE_WORKER_URL || 'https://noti.router.app.shsnews.live'}/unpin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId: game.id, subscriptionId }),
  });
};
