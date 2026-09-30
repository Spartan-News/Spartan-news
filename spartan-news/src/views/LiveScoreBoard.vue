<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Trophy, Activity } from 'lucide-vue-next';
import { startGameLiveActivity } from '../services/notifications.js';

const hudlScore = ref({
  isLive: false,
  sport: 'VARSITY ATHLETICS',
  homeTeam: 'Spartans',
  awayTeam: 'Visitors',
  homeScore: 0,
  awayScore: 0,
  gameClock: 'SCHEDULED'
});

const isSubscribed = ref(false);
let pollInterval = null;

// Fetch active scores from your Cloudflare Worker
const fetchHudlScore = async () => {
  try {
    const res = await fetch("https://spartan-youtube-notifier.lsg1.workers.dev/check-scores");
    if (res.ok) {
      const data = await res.json();
      if (data && data.isLive) {
        hudlScore.value = data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch Hudl score:", err);
  }
};

const subscribeToLiveScore = async () => {
  isSubscribed.value = true;
  await startGameLiveActivity(
    "sparta_game_score", 
    hudlScore.value.homeScore, 
    hudlScore.value.awayScore, 
    hudlScore.value.gameClock
  );
};

onMounted(() => {
  fetchHudlScore();
  // Poll Cloudflare Worker for score changes every 30 seconds
  pollInterval = setInterval(fetchHudlScore, 30000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<template>
  <div class="bg-slate-900 border border-blue-600/30 rounded-xl p-5 text-white shadow-xl max-w-md mx-auto my-6">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
      <div class="flex items-center gap-2">
        <Trophy class="w-5 h-5 text-amber-400" />
        <span class="font-bold text-sm tracking-wide uppercase">{{ hudlScore.sport }}</span>
      </div>
      <span 
        class="text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1"
        :class="hudlScore.isLive ? 'bg-red-600/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'"
      >
        <Activity class="w-3 h-3" /> {{ hudlScore.isLive ? 'LIVE' : 'OFFLINE' }}
      </span>
    </div>

    <div class="grid grid-cols-3 items-center text-center my-4">
      <div>
        <p class="text-xs text-slate-400 font-semibold uppercase">{{ hudlScore.homeTeam }}</p>
        <p class="text-4xl font-extrabold text-blue-400 mt-1">{{ hudlScore.homeScore }}</p>
      </div>
      <div>
        <p class="text-xs font-mono bg-slate-800 py-1 px-2 rounded text-slate-300 inline-block border border-slate-700">
          {{ hudlScore.gameClock }}
        </p>
      </div>
      <div>
        <p class="text-xs text-slate-400 font-semibold uppercase">{{ hudlScore.awayTeam }}</p>
        <p class="text-4xl font-extrabold text-slate-200 mt-1">{{ hudlScore.awayScore }}</p>
      </div>
    </div>

    <button 
      @click="subscribeToLiveScore"
      :disabled="!hudlScore.isLive"
      class="w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wider uppercase transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="isSubscribed ? 'bg-emerald-600 text-white' : 'bg-sparta-blue hover:bg-blue-700 text-white'"
    >
      {{ isSubscribed ? '✓ Live Updates Active on Lock Screen' : (hudlScore.isLive ? 'Pin Live Score to Lock Screen' : 'No Active Game to Pin') }}
    </button>
  </div>
</template>