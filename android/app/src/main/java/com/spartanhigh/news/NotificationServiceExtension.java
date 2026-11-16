package com.spartanhigh.news;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.Keep;
import androidx.core.app.NotificationCompat;

import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.INotificationServiceExtension;

import org.json.JSONObject;

import java.util.Collections;

@Keep
public class NotificationServiceExtension implements INotificationServiceExtension {
    private static final String CHANNEL_ID = "spartan_live_updates";
    private static final String PREFS = "spartan_live_update_state";

    @Override
    public void onNotificationReceived(INotificationReceivedEvent event) {
        JSONObject additionalData = event.getNotification().getAdditionalData();
        JSONObject live = additionalData == null ? null : additionalData.optJSONObject("live_notification");
        if (live == null) return;

        event.preventDefault(true);
        Context context = event.getContext();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        ensureChannel(context, manager);

        String gameId = live.optJSONObject("event_attributes") == null
                ? "score"
                : live.optJSONObject("event_attributes").optString("gameId", "score");
        String stateKey = "score:" + gameId;
        int notificationId = 1200 + Math.abs(gameId.hashCode() % 20000);
        String action = live.optString("event", "update");
        if ("end".equals(action)) {
            manager.cancel(notificationId);
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(stateKey).apply();
            return;
        }

        if ("start".equals(action)) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(stateKey).apply();
        } else if (context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(stateKey, false)) {
            return;
        }

        JSONObject attributes = live.optJSONObject("event_attributes");
        JSONObject updates = live.optJSONObject("event_updates");
        if (attributes == null) attributes = new JSONObject();
        if (updates == null) updates = new JSONObject();
        String title = attributes.optString("title", "Spartan News Live Score");
        String opponent = attributes.optString("opponent", "Opponent");
        int homeScore = updates.optInt("spartanScore", 0);
        int awayScore = updates.optInt("opponentScore", 0);
        String clock = updates.optString("clock", "LIVE");
        String score = "Spartans " + homeScore + " · " + opponent + " " + awayScore;

        Intent dismiss = new Intent(context, LiveUpdateDismissReceiver.class)
                .setAction("com.spartanhigh.news.LIVE_UPDATE_DISMISSED")
                .putExtra("stateKey", stateKey)
                .putExtra("notificationId", notificationId);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent dismissIntent = PendingIntent.getBroadcast(context, notificationId, dismiss, flags);

        Notification notification;
        if (Build.VERSION.SDK_INT >= 36) {
            Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(score + " · " + clock)
                    .setSmallIcon(android.R.drawable.ic_media_play)
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setAutoCancel(false)
                    .setDeleteIntent(dismissIntent)
                    .setShortCriticalText("LIVE")
                    .addAction(new Notification.Action.Builder(null, "Unpin", dismissIntent).build())
                    .setStyle(new Notification.ProgressStyle()
                            .setProgress(0)
                            .setProgressSegments(Collections.singletonList(new Notification.ProgressStyle.Segment(1))));
            Bundle extras = new Bundle();
            extras.putBoolean("android.requestPromotedOngoing", true);
            builder.addExtras(extras);
            notification = builder.build();
        } else {
            notification = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(score + " · " + clock)
                    .setSmallIcon(android.R.drawable.ic_media_play)
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setAutoCancel(false)
                    .setDeleteIntent(dismissIntent)
                    .addAction(0, "Unpin", dismissIntent)
                    .build();
        }
        manager.notify(notificationId, notification);
    }

    private static void ensureChannel(Context context, NotificationManager manager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Live score updates", NotificationManager.IMPORTANCE_LOW);
        channel.setDescription("Persistent score updates for games you choose to follow.");
        channel.setShowBadge(false);
        channel.enableVibration(false);
        channel.setSound(null, null);
        manager.createNotificationChannel(channel);
    }
}
