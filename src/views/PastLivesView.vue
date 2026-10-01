<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchLatestVideos } from '../services/youtube.js';
import { Tv, Search, RotateCcw, Calendar, Play, AlertCircle } from 'lucide-vue-next';

const streams = ref([]);
const loading = ref(true);
const apiError = ref(false);
const searchQuery = ref('');
const timeFilter = ref('month');

const loadPastStreams = async () => {
  loading.value = true;
  apiError.value = false;
  try {
    // Fetch completed broadcasts and video archives for SpartanNewsLive
    const fetched = await fetchLatestVideos('SpartanNewsLive', 24);
    if (fetched && fetched.length > 0) {
      streams.value = fetched;
    } else {
      streams.value = [];
      apiError.value = true;
    }
  } catch (err) {
    console.error('Failed to load past live stream replays:', err);
    streams.value = [];
    apiError.value = true;
  } finally {
    loading.value = false;
  }
};

const filteredStreams = computed(() => {
  const now = new Date();

  return streams.value.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    if (!matchesSearch) return false;

    if (timeFilter.value === 'all') return true;

    const publishedDate = new Date(stream.publishedAtRaw || Date.now());
    const diffDays = Math.ceil(Math.abs(now - publishedDate) / (1000 * 60 * 60 * 24));

    if (timeFilter.value === 'week') return diffDays <= 7;
    if (timeFilter.value === 'month') return diffDays <= 30;

    return true;
  });
});

onMounted(() => {
  loadPastStreams();
});
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header & Controls -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">
          Past Live Streams & Replays
        </h2>
        <p class="text-xs text-slate-400">
          Stream recordings and sports replays from @SpartanNewsLive
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- Time Filter Buttons -->
        <div class="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-bold">
          <button 
            @click="timeFilter = 'week'" 
            class="px-3 py-1.5 rounded transition"
            :class="timeFilter === 'week' ? 'bg-sparta-blue text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Past Week
          </button>
          <button 
            @click="timeFilter = 'month'" 
            class="px-3 py-1.5 rounded transition"
            :class="timeFilter === 'month' ? 'bg-sparta-blue text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Past Month
          </button>
          <button 
            @click="timeFilter = 'all'" 
            class="px-3 py-1.5 rounded transition"
            :class="timeFilter === 'all' ? 'bg-sparta-blue text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            All Time
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative flex-1 md:w-56">
          <Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search stream replays..." 
            class="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Refresh Button -->
        <button 
          @click="loadPastStreams" 
          class="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          title="Refresh Feed"
        >
          <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Skeleton Loading Grid -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="aspect-video bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
    </div>

    <!-- Live Stream Replays Grid -->
    <div v-else-if="filteredStreams.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="stream in filteredStreams"
        :key="stream.id"
        :to="`/live?v=${stream.id}`"
        class="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl overflow-hidden shadow-lg transition group flex flex-col"
      >
        <!-- Thumbnail -->
        <div class="relative aspect-video bg-slate-950 overflow-hidden">
          <img 
            :src="stream.thumbnail" 
            :alt="stream.title" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
          />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-sparta-blue text-white flex items-center justify-center shadow-lg">
              <Play class="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
          <h3 class="font-bold text-sm text-white line-clamp-2 group-hover:text-blue-400 transition">
            {{ stream.title }}
          </h3>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <Calendar class="w-3.5 h-3.5 text-slate-500" />
            <span>Streamed {{ stream.publishedAt }}</span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty / Error State -->
    <div v-else class="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-xl mx-auto my-12 space-y-2">
      <AlertCircle v-if="apiError" class="w-10 h-10 text-amber-500 mx-auto" />
      <Tv v-else class="w-10 h-10 text-slate-600 mx-auto" />
      <p class="text-sm font-bold text-slate-200">
        {{ apiError ? 'Unable to load YouTube stream replays.' : 'No stream recordings found for the selected timeframe.' }}
      </p>
      <p class="text-xs text-slate-500">
        {{ apiError ? 'Ensure VITE_YOUTUBE_API_KEY is configured in your .env.local file or Cloudflare Pages environment variables.' : 'Try switching to All Time or clearing your search query.' }}
      </p>
    </div>
  </div>
</template>