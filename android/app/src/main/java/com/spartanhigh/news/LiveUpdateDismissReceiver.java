package com.spartanhigh.news;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.annotation.Keep;

@Keep
public class LiveUpdateDismissReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String stateKey = intent.getStringExtra("stateKey");
        if (stateKey == null) return;
        context.getSharedPreferences("spartan_live_update_state", Context.MODE_PRIVATE)
                .edit().putBoolean(stateKey, true).apply();
        int notificationId = intent.getIntExtra("notificationId", -1);
        if (notificationId >= 0) {
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) manager.cancel(notificationId);
        }
    }
}
