<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Trophy, Activity, MapPin, User, ChevronRight } from 'lucide-vue-next';
import { startGameLiveActivity } from '../services/notifications.js';

const games = ref([]);
const activeGameIndex = ref(0);
const isSubscribed = ref(false);
let pollInterval = null;

const fetchHudlScores = async () => {
  try {
    const res = await fetch("https://spartan-youtube-notifier.lsg1.workers.dev/check-scores");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.games)) {
        games.value = data.games;
      }
    }
  } catch (err) {
    console.error("Failed to fetch Hudl scores:", err);
  }
};

const currentGame = computed(() => {
  return games.value[activeGameIndex.value] || null;
});

const subscribeToLiveScore = async () => {
  if (!currentGame.value) return;
  isSubscribed.value = true;
  await startGameLiveActivity(
    `sparta_${currentGame.value.id}`, 
    currentGame.value.homeTeam.score, 
    currentGame.value.awayTeam.score, 
    currentGame.value.gameClock
  );
};

onMounted(() => {
  fetchHudlScores();
  pollInterval = setInterval(fetchHudlScores, 30000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<template>
  <div class="space-y-4 max-w-xl mx-auto my-6">
    <!-- Multi-Game Tab Selector (When multiple games are happening) -->
    <div v-if="games.length > 1" class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        v-for="(game, idx) in games"
        :key="game.id"
        @click="activeGameIndex = idx"
        class="px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border"
        :class="activeGameIndex === idx 
          ? 'bg-sparta-blue border-blue-500 text-white shadow-lg' 
          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'"
      >
        <span class="w-2 h-2 rounded-full" :class="game.isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'"></span>
        {{ game.sport }} ({{ game.level }})
      </button>
    </div>

    <!-- Active Game Card -->
    <div v-if="currentGame" class="bg-slate-900 border border-blue-600/30 rounded-xl p-5 text-white shadow-xl">
      <!-- Game Header -->
      <div class="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <Trophy class="w-5 h-5 text-amber-400" />
          <div>
            <span class="font-bold text-sm tracking-wide uppercase block leading-tight">
              {{ currentGame.sport }}
            </span>
            <span class="text-[10px] text-slate-400 uppercase tracking-wider">
              Sparta {{ currentGame.level }} {{ currentGame.gender }}
            </span>
          </div>
        </div>
        <span 
          class="text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1"
          :class="currentGame.isLive ? 'bg-red-600/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'"
        >
          <Activity class="w-3 h-3" /> {{ currentGame.isLive ? 'LIVE' : 'SCHEDULED' }}
        </span>
      </div>

      <!-- Teams & Scoreboard Grid -->
      <div class="grid grid-cols-3 items-center text-center my-6 gap-2">
        <!-- Home Team -->
        <div class="space-y-1">
          <div class="w-12 h-12 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <img v-if="currentGame.homeTeam.logo" :src="currentGame.homeTeam.logo" :alt="currentGame.homeTeam.name" class="w-10 h-10 object-contain" />
            <span v-else class="font-black text-blue-400 text-lg">S</span>
          </div>
          <p class="text-xs text-slate-300 font-bold uppercase truncate">{{ currentGame.homeTeam.name }}</p>
          <p class="text-4xl font-extrabold text-blue-400">{{ currentGame.homeTeam.score }}</p>
        </div>

        <!-- Clock / Period -->
        <div class="space-y-2">
          <span class="text-xs font-mono bg-slate-800 py-1.5 px-3 rounded-md text-slate-200 inline-block border border-slate-700 shadow-inner">
            {{ currentGame.gameClock }}
          </span>
          <p v-if="currentGame.period" class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {{ currentGame.period }}
          </p>
        </div>

        <!-- Away Team -->
        <div class="space-y-1">
          <div class="w-12 h-12 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <img v-if="currentGame.awayTeam.logo" :src="currentGame.awayTeam.logo" :alt="currentGame.awayTeam.name" class="w-10 h-10 object-contain" />
            <span v-else class="font-black text-slate-400 text-lg">V</span>
          </div>
          <p class="text-xs text-slate-300 font-bold uppercase truncate">{{ currentGame.awayTeam.name }}</p>
          <p class="text-4xl font-extrabold text-slate-200">{{ currentGame.awayTeam.score }}</p>
        </div>
      </div>

      <!-- Venue / Location Info -->
      <div v-if="currentGame.venue" class="flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3 mb-4">
        <MapPin class="w-3.5 h-3.5 text-slate-500" />
        <span>{{ currentGame.venue }}</span>
      </div>

      <!-- Key Player Highlights (If available) -->
      <div v-if="currentGame.topPlayers && currentGame.topPlayers.length" class="bg-slate-950/60 rounded-lg p-3 border border-slate-800 mb-4 space-y-2">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <User class="w-3 h-3 text-amber-400" /> Key Performers
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div v-for="player in currentGame.topPlayers" :key="player.name" class="text-xs flex justify-between bg-slate-900 p-2 rounded border border-slate-800/80">
            <span class="font-semibold text-slate-200">#{{ player.number }} {{ player.name }}</span>
            <span class="text-blue-400 font-mono font-bold">{{ player.stat }}</span>
          </div>
        </div>
      </div>

      <!-- Lock Screen Pin Action -->
      <button 
        @click="subscribeToLiveScore"
        :disabled="!currentGame.isLive"
        class="w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wider uppercase transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="isSubscribed ? 'bg-emerald-600 text-white' : 'bg-sparta-blue hover:bg-blue-700 text-white'"
      >
        {{ isSubscribed ? '✓ Live Updates Active on Lock Screen' : (currentGame.isLive ? 'Pin Live Score to Lock Screen' : 'No Active Stream to Pin') }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
      <Trophy class="w-8 h-8 text-slate-600 mx-auto mb-2" />
      <p class="text-sm font-bold">No High School Games Scheduled Right Now</p>
      <p class="text-xs text-slate-500 mt-1">Check back closer to game time for live scores and player stats.</p>
    </div>
  </div>
</template>