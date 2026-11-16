<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Tv, Radio, Calendar, RefreshCw, Trophy, Activity } from 'lucide-vue-next';
import { checkLiveStatus, fetchUpcomingStreams } from '../services/youtube.js';
import { startGameLiveActivity } from '../services/notifications.js';
import { WORKER_URL } from '../services/config.js';

// Official channel ID for @SpartanNewsLive
const SPARTAN_CHANNEL_ID = 'UCMbRanNiBOBeop8qZkBAwlA';
const SPARTAN_CHANNEL_HANDLE = 'SpartanNewsLive';

const isLive = ref(false);
const currentLiveVideoId = ref('');
const liveStreamTitle = ref('');
const upcomingStreams = ref([]);
const showAllUpcoming = ref(false);
const visibleUpcomingStreams = computed(() =>
  showAllUpcoming.value ? upcomingStreams.value : upcomingStreams.value.slice(0, 4)
);
const youtubeError = ref('');
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
const isNativeApp = Boolean(window?.Capacitor?.isNativePlatform?.());
let hudlTimer = null;
let youtubeTimer = null;

// Fetch Live Scores from Cloudflare Worker Hudl Endpoint
const fetchHudlScore = async () => {
  try {
    const res = await fetch(`${WORKER_URL}/check-scores`);
    if (res.ok) {
      const data = await res.json();
      const liveGame = data?.games?.find(game => game.isLive || ['LIVE', 'IN_PROGRESS', 'IN PROGRESS'].includes(String(game.status || '').toUpperCase()));
      if (liveGame) {
        hudlScore.value = {
          ...hudlScore.value,
          ...liveGame,
          id: liveGame.id || liveGame.scheduleEntryId || liveGame.gameId,
          isLive: true,
          homeTeam: liveGame.homeTeam?.name || liveGame.homeTeam || 'Spartans',
          awayTeam: liveGame.awayTeam?.name || liveGame.awayTeam || 'Opponent',
          homeScore: liveGame.homeTeam?.score ?? liveGame.homeScore ?? 0,
          awayScore: liveGame.awayTeam?.score ?? liveGame.awayScore ?? 0,
        };
      } else if (data?.isLive) {
        hudlScore.value = { ...hudlScore.value, ...data };
      } else {
        hudlScore.value.isLive = false;
      }
    }
  } catch (err) {
    console.error("Hudl score fetch failed:", err);
  }
};

const pinScoreToLockScreen = async () => {
  if (!hudlScore.value.id) return;
  try {
    await startGameLiveActivity(
      hudlScore.value.id,
      hudlScore.value.homeScore,
      hudlScore.value.awayScore,
      hudlScore.value.gameClock,
      { sport: hudlScore.value.sport, opponent: hudlScore.value.awayTeam }
    );
    isSubscribedToLiveActivity.value = true;
  } catch (err) {
    console.error('Could not start score Live Activity:', err);
  }
};

const checkLiveAndSchedule = async () => {
  loading.value = true;
  youtubeError.value = '';

  const [liveResult, scheduleResult] = await Promise.allSettled([
    checkLiveStatus(SPARTAN_CHANNEL_HANDLE),
    fetchUpcomingStreams()
  ]);

  if (liveResult.status === 'fulfilled') {
    const liveInfo = liveResult.value;
    if (liveInfo.isLive) {
      isLive.value = true;
      currentLiveVideoId.value = liveInfo.videoId;
      liveStreamTitle.value = liveInfo.title || 'Spartan News Network - Live Stream';
    } else {
      isLive.value = false;
      currentLiveVideoId.value = '';
      liveStreamTitle.value = '';
    }
  } else {
    console.error('YouTube Live status check failed:', liveResult.reason);
  }

  if (scheduleResult.status === 'fulfilled') {
    upcomingStreams.value = scheduleResult.value;
  } else {
    console.error('Google Calendar schedule fetch failed:', scheduleResult.reason);
  }

  const errors = [liveResult, scheduleResult]
    .filter(result => result.status === 'rejected')
    .map(result => result.reason instanceof Error ? result.reason.message : 'Unable to load YouTube live data.');
  youtubeError.value = errors.join(' ');
  loading.value = false;
};

onMounted(() => {
  checkLiveAndSchedule();
  fetchHudlScore();
  youtubeTimer = setInterval(checkLiveAndSchedule, 60000);
  // Poll for Hudl live game score updates every 30 seconds
  hudlTimer = setInterval(fetchHudlScore, 30000);
});

onUnmounted(() => {
  if (hudlTimer) clearInterval(hudlTimer);
  if (youtubeTimer) clearInterval(youtubeTimer);
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

    <p v-if="youtubeError" role="alert" class="text-sm text-amber-300">
      {{ youtubeError }}
    </p>

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

      <button v-if="isNativeApp && hudlScore.id"
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
              <Calendar class="w-4 h-4 text-sparta-gold" /> Upcoming Spartan News Events
            </h4>

            <a href="https://calendar.google.com/calendar/u/0?cid=ZmNlMDNmMmFmNThlNmQzMDNiNjEwZGEzZGY2ZTM5MjQ1ZDBlN2U4YTRiYmJlMGNlNTY1NWQ0OGNmZDgwNzU4NEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t" target="_blank" rel="noopener noreferrer" class="block text-[11px] font-semibold text-blue-400 hover:text-blue-300">Open full Google Calendar</a>

            <ul
              v-if="upcomingStreams.length > 0"
              class="text-xs space-y-2 text-slate-400"
              :class="showAllUpcoming ? 'max-h-56 overflow-y-auto pr-1' : ''"
            >
              <li 
                v-for="stream in visibleUpcomingStreams"
                :key="stream.id"
                class="flex flex-col border-b border-slate-800/60 pb-1.5 gap-0.5"
              >
                <span class="text-slate-200 font-semibold line-clamp-1">{{ stream.title }}</span>
                <span class="text-sparta-gold font-mono text-[11px]">{{ stream.scheduledTime }}</span>
              </li>
            </ul>

            <button
              v-if="upcomingStreams.length > 4"
              type="button"
              class="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
              @click="showAllUpcoming = !showAllUpcoming"
            >
              {{ showAllUpcoming ? 'Show fewer events' : `Show all ${upcomingStreams.length} events` }}
            </button>

            <div v-if="upcomingStreams.length === 0 && !loading" class="text-xs text-slate-500 py-1 font-medium">
              No upcoming events are scheduled on the Google Calendar.
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
