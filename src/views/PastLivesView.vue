<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Play, Search, Filter, RefreshCw, Tv, X } from 'lucide-vue-next';
import { fetchLatestVideos } from '../services/youtube.js';

const timeFilter = ref('month');
const searchQuery = ref('');
const loading = ref(true);
const displayLimit = ref(12);
const videos = ref([]);
const activePlayingId = ref(null); // Tracks currently playing replay ID

const getPublishedAfterDate = (filter) => {
  const now = new Date();
  if (filter === 'week') {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (filter === 'month') {
    now.setMonth(now.getMonth() - 1);
    return now.toISOString();
  }
  return null;
};

const loadPastLives = async () => {
  loading.value = true;
  const publishedAfter = getPublishedAfterDate(timeFilter.value);
  const data = await fetchLatestVideos('SpartanNewsLive', 30, publishedAfter);
  videos.value = data;
  loading.value = false;
};

onMounted(() => {
  loadPastLives();
});

watch(timeFilter, () => {
  displayLimit.value = 12;
  loadPastLives();
});

const filteredVideos = computed(() => {
  let list = [...videos.value];
  if (searchQuery.value.trim()) {
    list = list.filter(v => v.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }
  return list;
});

const visibleVideos = computed(() => {
  return filteredVideos.value.slice(0, displayLimit.value);
});

const playVideo = (id) => {
  activePlayingId.value = id;
};

const stopVideo = () => {
  activePlayingId.value = null;
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Past Live Streams & Replays</h2>
        <p class="text-sm text-slate-400">Stream recordings and sports replays from @SpartanNewsLive</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center gap-1">
          <Filter class="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          <button 
            @click="timeFilter = 'week'"
            :class="timeFilter === 'week' ? 'bg-slate-800 text-sparta-gold font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 text-xs rounded-md transition"
          >
            Past Week
          </button>
          <button 
            @click="timeFilter = 'month'"
            :class="timeFilter === 'month' ? 'bg-slate-800 text-sparta-gold font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 text-xs rounded-md transition"
          >
            Past Month
          </button>
          <button 
            @click="timeFilter = 'all'"
            :class="timeFilter === 'all' ? 'bg-slate-800 text-sparta-gold font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 text-xs rounded-md transition"
          >
            All Time
          </button>
        </div>

        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search stream replays..." 
            class="bg-slate-900 border border-slate-800 pl-9 pr-4 py-1.5 text-xs rounded-lg focus:outline-none focus:border-sparta-gold text-slate-200 w-44"
          />
        </div>

        <button @click="loadPastLives" class="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Video Grid with In-Page Embedded Playback -->
    <div v-if="visibleVideos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="video in visibleVideos" 
        :key="video.id"
        class="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-sparta-gold/50 transition duration-200 flex flex-col justify-between"
      >
        <!-- Embedded Replay Player Unit -->
        <div class="relative aspect-video bg-black overflow-hidden">
          <iframe 
            v-if="activePlayingId === video.id"
            :src="`https://www.youtube.com/embed/${video.id}?autoplay=1`"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>

          <div v-else @click="playVideo(video.id)" class="w-full h-full cursor-pointer relative">
            <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
              <div class="w-12 h-12 rounded-full bg-sparta-green/90 text-sparta-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                <Play class="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>

          <!-- Stop / Close Replay Button -->
          <button 
            v-if="activePlayingId === video.id"
            @click="stopVideo"
            class="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white p-1.5 rounded-full transition z-10"
            title="Close Replay"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-sparta-gold uppercase tracking-wider">
              Spartan News Live Replay
            </span>
            <h3 class="text-sm font-bold text-slate-100 line-clamp-2 leading-snug mt-1">
              {{ video.title }}
            </h3>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-slate-800/80 mt-2">
            <p class="text-xs text-slate-500">
              Streamed {{ video.publishedAt }}
            </p>
            <button 
              v-if="activePlayingId !== video.id"
              @click="playVideo(video.id)"
              class="text-xs font-bold text-sparta-gold hover:underline flex items-center gap-1"
            >
              Watch Replay
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
      <Tv class="w-10 h-10 text-slate-600 mx-auto mb-2" />
      <p class="text-slate-400 font-medium">No live stream recordings found for the selected timeframe.</p>
    </div>

    <div v-if="filteredVideos.length > displayLimit" class="text-center pt-4">
      <button 
        @click="displayLimit += 12"
        class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sparta-gold/40 text-xs font-bold rounded-lg transition text-slate-200"
      >
        Load More Stream Replays
      </button>
    </div>
  </div>
</template>