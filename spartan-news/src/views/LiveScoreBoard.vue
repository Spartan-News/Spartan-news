<script setup>
import { ref } from 'vue';
import { Trophy, Activity } from 'lucide-vue-next';
import { startGameLiveActivity } from '../services/notifications.js';

const homeScore = ref(14);
const awayScore = ref(7);
const gameClock = ref("Q3 08:42");
const isSubscribed = ref(false);

const subscribeToLiveScore = async () => {
  isSubscribed.value = true;
  await startGameLiveActivity("sparta_football_game", homeScore.value, awayScore.value, gameClock.value);
};
</script>

<template>
  <div class="bg-slate-900 border border-blue-600/30 rounded-xl p-5 text-white shadow-xl max-w-md mx-auto my-6">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
      <div class="flex items-center gap-2">
        <Trophy class="w-5 h-5 text-amber-400" />
        <span class="font-bold text-sm tracking-wide">VARSITY FOOTBALL</span>
      </div>
      <span class="bg-red-600/20 text-red-400 text-xs font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
        <Activity class="w-3 h-3" /> LIVE
      </span>
    </div>

    <div class="grid grid-cols-3 items-center text-center my-4">
      <div>
        <p class="text-xs text-slate-400 font-semibold uppercase">Spartans</p>
        <p class="text-4xl font-extrabold text-blue-400 mt-1">{{ homeScore }}</p>
      </div>
      <div>
        <p class="text-xs font-mono bg-slate-800 py-1 px-2 rounded text-slate-300 inline-block">
          {{ gameClock }}
        </p>
      </div>
      <div>
        <p class="text-xs text-slate-400 font-semibold uppercase">Visitors</p>
        <p class="text-4xl font-extrabold text-slate-200 mt-1">{{ awayScore }}</p>
      </div>
    </div>

    <button 
      @click="subscribeToLiveScore"
      class="w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wider uppercase transition flex justify-center items-center gap-2"
      :class="isSubscribed ? 'bg-emerald-600 text-white' : 'bg-sparta-blue hover:bg-blue-700 text-white'"
    >
      {{ isSubscribed ? '✓ Live Updates Active on Lock Screen' : 'Pin Live Score to Lock Screen' }}
    </button>
  </div>
</template>