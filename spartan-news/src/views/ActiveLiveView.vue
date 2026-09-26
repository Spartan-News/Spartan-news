<script setup>
import { ref, onMounted } from 'vue';
import { Tv, Radio, Calendar, RefreshCw } from 'lucide-vue-next';
import { checkLiveStatus, fetchUpcomingStreams } from '../services/youtube.js';

const isLive = ref(false);
const currentLiveVideoId = ref('');
const liveStreamTitle = ref('');
const upcomingStreams = ref([]);
const loading = ref(true);

const checkLiveAndSchedule = async () => {
  loading.value = true;
  
  // 1. Check if a stream is currently live
  const liveInfo = await checkLiveStatus('SpartanNewsLive');
  if (liveInfo && liveInfo.isLive) {
    isLive.value = true;
    currentLiveVideoId.value = liveInfo.videoId;
    liveStreamTitle.value = liveInfo.title;
  } else {
    isLive.value = false;
    currentLiveVideoId.value = '';
    liveStreamTitle.value = '';
  }

  // 2. Fetch upcoming scheduled streams from YouTube
  const scheduled = await fetchUpcomingStreams('SpartanNewsLive');
  upcomingStreams.value = scheduled;

  loading.value = false;
};

onMounted(() => {
  checkLiveAndSchedule();
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
          <iframe 
            v-if="isLive && currentLiveVideoId"
            :src="`https://www.youtube.com/embed/${currentLiveVideoId}?autoplay=1`"
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