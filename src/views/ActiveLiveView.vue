<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Tv, Radio, Calendar, RefreshCw, Trophy, Activity } from 'lucide-vue-next';
import { checkLiveStatus, fetchUpcomingStreams } from '../services/youtube.js';
import { startGameLiveActivity } from '../services/notifications.js';

// Official Channel ID for @spartannewslive
const SPARTAN_CHANNEL_ID = 'UCngrGmmna1EEp5Q940Fy95g';

const isLive = ref(false);
const currentLiveVideoId = ref('');
const liveStreamTitle = ref('');
const upcomingStreams = ref([]);
const loading = ref(true);

// Hudl Live Score State
const hudlScore = ref({
  isLive: false,
  sport: 'Spartan Athletics',
  homeTeam: 'Spartans',
  awayTeam: 'Opponent',
  homeScore: 0,
  awayScore: 0,
  gameClock: 'SCHEDULED'
});

const isSubscribedToLiveActivity = ref(false);
let hudlTimer = null;

// Fetch Live Scores from Cloudflare Worker Hudl Endpoint
const fetchHudlScore = async () => {
  try {
    const res = await fetch("https://noti.router.app.shsnews.live/check-scores");
    if (res.ok) {
      const data = await res.json();
      if (data && data.isLive) {
        hudlScore.value = data;
      } else {
        hudlScore.value.isLive = false;
      }
    }
  } catch (err) {
    console.error("Hudl score fetch failed:", err);
  }
};

const pinScoreToLockScreen = async () => {
  isSubscribedToLiveActivity.value = true;
  await startGameLiveActivity(
    "sparta_game_score",
    hudlScore.value.homeScore,
    hudlScore.value.awayScore,
    hudlScore.value.gameClock
  );
};

const checkLiveAndSchedule = async () => {
  loading.value = true;
  
  try {
    // 1. Check YouTube Live Status using exact Channel ID
    const liveInfo = await checkLiveStatus(SPARTAN_CHANNEL_ID);
    if (liveInfo && liveInfo.isLive) {
      isLive.value = true;
      currentLiveVideoId.value = liveInfo.videoId;
      liveStreamTitle.value = liveInfo.title || 'Spartan News Network - Live Stream';
    } else {
      isLive.value = false;
      currentLiveVideoId.value = '';
      liveStreamTitle.value = '';
    }

    // 2. Fetch Upcoming Scheduled Streams using exact Channel ID
    const scheduled = await fetchUpcomingStreams(SPARTAN_CHANNEL_ID);
    upcomingStreams.value = scheduled || [];
  } catch (err) {
    console.error("YouTube Live check failed:", err);
    isLive.value = false;
  }

  // 3. Fetch Live Hudl Game Scores
  await fetchHudlScore();

  loading.value = false;
};

onMounted(() => {
  checkLiveAndSchedule();
  // Poll for Hudl live game score updates every 30 seconds
  hudlTimer = setInterval(fetchHudlScore, 30000);
});

onUnmounted(() => {
  if (hudlTimer) clearInterval(hudlTimer);
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Radio class="w-6 h-6 text-red-500 animate-pulse" /> Current Live Broadcast
        </h2>
        <p class="text-sm text-slate-400">Official live streaming feed from Sparta Senior High School</p>
      </div>
      <button @click="checkLiveAndSchedule" class="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition" title="Refresh Live Data">
        <RefreshCw class="w-4 h-4 text-slate-300" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <!-- Real-time Hudl Live Score Banner -->
    <section v-if="hudlScore.isLive" class="bg-slate-900 border border-blue-600/40 rounded-2xl p-5 text-white shadow-2xl max-w-2xl mx-auto">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <Trophy class="w-5 h-5 text-amber-400" />
          <span class="font-black text-xs uppercase tracking-wider text-blue-400">{{ hudlScore.sport }}</span>
        </div>
        <span class="bg-red-600/20 text-red-400 text-xs font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
          <Activity class="w-3.5 h-3.5" /> LIVE HUDL SCORE
        </span>
      </div>

      <div class="grid grid-cols-3 items-center text-center my-4">
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase">{{ hudlScore.homeTeam }}</p>
          <p class="text-4xl font-extrabold text-blue-400 mt-1">{{ hudlScore.homeScore }}</p>
        </div>
        <div>
          <p class="text-xs font-mono bg-slate-800 py-1 px-2.5 rounded text-slate-300 inline-block border border-slate-700">
            {{ hudlScore.gameClock }}
          </p>
        </div>
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase">{{ hudlScore.awayTeam }}</p>
          <p class="text-4xl font-extrabold text-slate-200 mt-1">{{ hudlScore.awayScore }}</p>
        </div>
      </div>

      <button 
        @click="pinScoreToLockScreen"
        class="w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition flex justify-center items-center gap-2"
        :class="isSubscribedToLiveActivity ? 'bg-emerald-600 text-white' : 'bg-sparta-blue hover:bg-blue-700 text-white'"
      >
        {{ isSubscribedToLiveActivity ? '✓ Score Updates Pinned to Lock Screen' : 'Pin Live Score to Lock Screen' }}
      </button>
    </section>

    <!-- Active Broadcast Player -->
    <section class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div class="bg-slate-800/80 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span v-if="isLive" class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span v-else class="h-3 w-3 rounded-full bg-slate-500"></span>
          <span class="text-xs font-bold uppercase tracking-wider" :class="isLive ? 'text-red-400' : 'text-slate-400'">
            {{ isLive ? 'LIVE NOW' : 'OFFLINE' }}
          </span>
        </div>
        <span class="text-xs text-slate-400">Spartan News Network</span>
      </div>

      <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800">
          <!-- Active Stream Player -->
          <iframe 
            v-if="isLive"
            :src="currentLiveVideoId ? `https://www.youtube.com/embed/${currentLiveVideoId}?autoplay=1` : `https://www.youtube.com/embed/live_stream?channel=${SPARTAN_CHANNEL_ID}&autoplay=1`"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/90">
            <Tv class="w-16 h-16 text-slate-700 mb-3" />
            <h3 class="text-lg font-bold text-slate-300">No Stream Active Right Now</h3>
            <p class="text-sm text-slate-500 max-w-md mt-1">
              There are no live broadcasts running at this moment. Check out past broadcasts on the Past Live Streams page.
            </p>
            <router-link to="/pastlives" class="mt-4 px-4 py-2 bg-sparta-green hover:bg-sparta-light text-white text-xs font-bold rounded-lg transition">
              View Stream Replays
            </router-link>
          </div>
        </div>

        <div class="flex flex-col justify-between space-y-4">
          <div>
            <span class="text-xs font-bold text-sparta-gold uppercase tracking-wider">Broadcast Status</span>
            <h2 class="text-xl font-extrabold text-white mt-1 leading-snug">
              {{ isLive ? liveStreamTitle : 'Sparta High School Live Stream' }}
            </h2>
            <p class="text-sm text-slate-400 mt-2">
              Broadcasted live from Sparta Senior High School by the student streaming crew.
            </p>
          </div>

          <!-- Dynamic Upcoming Broadcast Schedule -->
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Calendar class="w-4 h-4 text-sparta-gold" /> Upcoming Scheduled Streams
            </h4>

            <ul v-if="upcomingStreams.length > 0" class="text-xs space-y-2 text-slate-400">
              <li 
                v-for="stream in upcomingStreams" 
                :key="stream.id"
                class="flex flex-col border-b border-slate-800/60 pb-1.5 gap-0.5"
              >
                <span class="text-slate-200 font-semibold line-clamp-1">{{ stream.title }}</span>
                <span class="text-sparta-gold font-mono text-[11px]">{{ stream.scheduledTime }}</span>
              </li>
            </ul>

            <div v-else-if="!loading" class="text-xs text-slate-500 py-1 font-medium">
              No upcoming streams scheduled on YouTube.
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
