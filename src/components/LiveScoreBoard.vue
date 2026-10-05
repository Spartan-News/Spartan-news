<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { Trophy, Activity, MapPin, User, Calendar, Clock, ChevronLeft, ChevronRight, Bell } from 'lucide-vue-next';
import {
  canPinToLockScreen,
  getPinnedIds,
  forgetPin,
  pinGameToLockScreen,
  unpinGame,
  getScoreAlertsEnabled,
  setScoreAlerts,
} from '../services/notifications.js';

const games = ref([]);
const activeGameIndex = ref(0);
const filterCategory = ref('all');
const pinnedIds = ref(getPinnedIds());
const pinBusy = ref(false);
const pinError = ref('');
const alertsOn = ref(getScoreAlertsEnabled());
const alertsBusy = ref(false);
const alertsMsg = ref('');

// Scroll indicator states & refs
const tabsContainer = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

let pollInterval = null;

const fetchHudlScores = async () => {
  try {
    const res = await fetch("https://spartan-youtube-notifier.lsg1.workers.dev/check-scores");
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.games)) {
        games.value = data.games;
        prunePins();
        await nextTick();
        checkScrollOverflow();
      }
    }
  } catch (err) {
    console.error("Failed to fetch Hudl scores:", err);
  }
};

const checkScrollOverflow = () => {
  if (!tabsContainer.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value;
  canScrollLeft.value = scrollLeft > 5;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 5;
};

const scrollTabs = (direction) => {
  if (!tabsContainer.value) return;
  const scrollAmount = direction === 'left' ? -150 : 150;
  tabsContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
};

const filteredGames = computed(() => {
  let list = games.value;
  if (filterCategory.value === 'live') list = list.filter(g => g.isLive);
  else if (filterCategory.value === 'upcoming') list = list.filter(g => g.isFuture);
  else if (filterCategory.value === 'final') list = list.filter(g => g.status === 'FINAL');
  // Pinned games float to the top (sort is stable, so the rest keep their order).
  return [...list].sort((a, b) => Number(pinnedIds.value.includes(b.id)) - Number(pinnedIds.value.includes(a.id)));
});

const currentGame = computed(() => {
  return filteredGames.value[activeGameIndex.value] || null;
});

const isPinned = computed(() => !!currentGame.value && pinnedIds.value.includes(currentGame.value.id));

const pinLabel = computed(() => {
  const g = currentGame.value;
  if (!g) return '';
  if (pinBusy.value) return 'Working...';
  if (isPinned.value) return '✓ Pinned to Lock Screen (tap to stop)';
  if (g.isLive) return 'Pin Live Score to Lock Screen';
  return g.isFuture ? 'Live Pin Available at Gametime' : 'Game Completed';
});

// A pinned game that has finished (or been removed) is over on the lock screen too.
const prunePins = () => {
  for (const id of getPinnedIds()) {
    const g = games.value.find(x => x.id === id);
    if (!g || g.status === 'FINAL') forgetPin(id);
  }
  pinnedIds.value = getPinnedIds();
};

const togglePin = async () => {
  const game = currentGame.value;
  if (!game || pinBusy.value) return;
  pinBusy.value = true;
  pinError.value = '';
  try {
    if (isPinned.value) await unpinGame(game);
    else await pinGameToLockScreen(game);
    pinnedIds.value = getPinnedIds();
    // Pinned games move to the top, so keep the same game on screen.
    const idx = filteredGames.value.findIndex(g => g.id === game.id);
    if (idx >= 0) activeGameIndex.value = idx;
  } catch (err) {
    pinError.value = err.message || 'Could not update the pin. Please try again.';
  } finally {
    pinBusy.value = false;
  }
};

const toggleAlerts = async () => {
  if (alertsBusy.value) return;
  alertsBusy.value = true;
  alertsMsg.value = '';
  const want = !alertsOn.value;
  try {
    const changed = await setScoreAlerts(want);
    if (changed) alertsOn.value = want;
    else alertsMsg.value = 'Allow notifications to turn on score alerts.';
  } catch (err) {
    alertsMsg.value = 'Could not update score alerts. Please try again.';
  } finally {
    alertsBusy.value = false;
  }
};

onMounted(() => {
  fetchHudlScores();
  pollInterval = setInterval(fetchHudlScores, 30000);
  window.addEventListener('resize', checkScrollOverflow);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  window.removeEventListener('resize', checkScrollOverflow);
});
</script>

<template>
  <div class="space-y-4 max-w-xl mx-auto my-6">
    <!-- Category Filter Tabs -->
    <div class="flex justify-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs font-bold">
      <button 
        @click="filterCategory = 'all'; activeGameIndex = 0; nextTick(checkScrollOverflow)" 
        class="px-3 py-1.5 rounded-lg transition"
        :class="filterCategory === 'all' ? 'bg-sparta-blue text-white shadow' : 'text-slate-400 hover:text-white'"
      >
        All Games
      </button>
      <button 
        @click="filterCategory = 'live'; activeGameIndex = 0; nextTick(checkScrollOverflow)" 
        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1"
        :class="filterCategory === 'live' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'"
      >
        <span class="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span> Live
      </button>
      <button 
        @click="filterCategory = 'upcoming'; activeGameIndex = 0; nextTick(checkScrollOverflow)" 
        class="px-3 py-1.5 rounded-lg transition"
        :class="filterCategory === 'upcoming' ? 'bg-sparta-blue text-white shadow' : 'text-slate-400 hover:text-white'"
      >
        Upcoming
      </button>
      <button 
        @click="filterCategory = 'final'; activeGameIndex = 0; nextTick(checkScrollOverflow)" 
        class="px-3 py-1.5 rounded-lg transition"
        :class="filterCategory === 'final' ? 'bg-sparta-blue text-white shadow' : 'text-slate-400 hover:text-white'"
      >
        Final
      </button>
    </div>

    <!-- Optional Score Alerts -->
    <div class="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white">
      <div class="flex items-center gap-3 min-w-0">
        <Bell class="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div class="min-w-0">
          <p class="text-xs font-bold">Score alerts</p>
          <p class="text-[11px] text-slate-400">Get a notification when a game starts, the score changes, and when it ends.</p>
        </div>
      </div>
      <button
        @click="toggleAlerts"
        :disabled="alertsBusy"
        role="switch"
        :aria-checked="alertsOn"
        class="relative w-11 h-6 rounded-full transition flex-shrink-0 disabled:opacity-60"
        :class="alertsOn ? 'bg-emerald-600' : 'bg-slate-700'"
        title="Toggle score alerts"
      >
        <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform" :class="alertsOn ? 'translate-x-5' : ''"></span>
      </button>
    </div>
    <p v-if="alertsMsg" class="text-xs text-amber-400 font-semibold text-center">{{ alertsMsg }}</p>

    <!-- Multi-Game Tab Selector with Arrow Indicators -->
    <div v-if="filteredGames.length > 1" class="relative flex items-center group">
      <!-- Left Arrow Button -->
      <button 
        v-if="canScrollLeft"
        @click="scrollTabs('left')"
        class="absolute left-0 z-10 p-1.5 bg-slate-900/90 border border-slate-700 text-white rounded-full shadow-lg backdrop-blur hover:bg-sparta-blue transition -ml-2"
        title="Scroll Left"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Scrollable Tab Container -->
      <div 
        ref="tabsContainer"
        @scroll="checkScrollOverflow"
        class="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-none w-full scroll-smooth"
      >
        <button
          v-for="(game, idx) in filteredGames"
          :key="game.id"
          @click="activeGameIndex = idx"
          class="px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border flex-shrink-0"
          :class="activeGameIndex === idx 
            ? 'bg-sparta-blue border-blue-500 text-white shadow-lg' 
            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'"
        >
          <span class="w-2 h-2 rounded-full" :class="game.isLive ? 'bg-red-500 animate-pulse' : (game.isFuture ? 'bg-blue-400' : 'bg-slate-600')"></span>
          {{ game.sport }} ({{ game.level }})
        </button>
      </div>

      <!-- Right Arrow Button -->
      <button 
        v-if="canScrollRight"
        @click="scrollTabs('right')"
        class="absolute right-0 z-10 p-1.5 bg-slate-900/90 border border-slate-700 text-white rounded-full shadow-lg backdrop-blur hover:bg-sparta-blue transition -mr-2"
        title="Scroll Right"
      >
        <ChevronRight class="w-4 h-4" />
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
        
        <!-- Status Badge -->
        <span 
          class="text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1"
          :class="currentGame.isLive ? 'bg-red-600/20 text-red-400 animate-pulse' : (currentGame.isFuture ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400')"
        >
          <Activity v-if="currentGame.isLive" class="w-3 h-3" />
          <Calendar v-else-if="currentGame.isFuture" class="w-3 h-3" />
          {{ currentGame.isLive ? 'LIVE' : (currentGame.isFuture ? 'UPCOMING' : 'FINAL') }}
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
          <p class="text-4xl font-extrabold text-blue-400">{{ currentGame.isFuture ? '-' : currentGame.homeTeam.score }}</p>
        </div>

        <!-- Clock / Start Time -->
        <div class="space-y-2">
          <span class="text-xs font-mono bg-slate-800 py-1.5 px-3 rounded-md text-slate-200 inline-block border border-slate-700 shadow-inner">
            <Clock v-if="currentGame.isFuture" class="w-3 h-3 inline mr-1 text-blue-400" />
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
          <p class="text-4xl font-extrabold text-slate-200">{{ currentGame.isFuture ? '-' : currentGame.awayTeam.score }}</p>
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

      <!-- Lock Screen Pin Action (available in the Spartan News app) -->
      <template v-if="canPinToLockScreen()">
        <button
          @click="togglePin"
          :disabled="pinBusy || (!isPinned && !currentGame.isLive)"
          class="w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wider uppercase transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isPinned ? 'bg-emerald-600 text-white' : 'bg-sparta-blue hover:bg-blue-700 text-white'"
        >
          {{ pinLabel }}
        </button>
        <p v-if="pinError" class="text-xs text-red-400 font-semibold text-center mt-2">{{ pinError }}</p>
      </template>
      <p v-else class="text-[11px] text-center text-slate-500">
        Get live scores on your lock screen in the Spartan News app.
      </p>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
      <Trophy class="w-8 h-8 text-slate-600 mx-auto mb-2" />
      <p class="text-sm font-bold">No Games Found</p>
      <p class="text-xs text-slate-500 mt-1">There are no high school games matching the selected filter right now.</p>
    </div>
  </div>
</template>