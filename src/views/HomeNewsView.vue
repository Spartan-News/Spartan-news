<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchLatestVideos } from '../services/youtube.js';
import { Tv, Search, RotateCcw, Calendar, Play, Sparkles, AlertCircle } from 'lucide-vue-next';

const newsVideos = ref([]);
const loading = ref(true);
const apiError = ref(false);
const searchQuery = ref('');
const timeFilter = ref('month');

const loadNews = async () => {
  loading.value = true;
  apiError.value = false;
  try {
    const fetched = await fetchLatestVideos('spartannewsdaily8847', 20);
    if (fetched && fetched.length > 0) {
      newsVideos.value = fetched;
    } else {
      newsVideos.value = [];
      apiError.value = true;
    }
  } catch (err) {
    console.error('Failed to load YouTube news:', err);
    newsVideos.value = [];
    apiError.value = true;
  } finally {
    loading.value = false;
  }
};

const filteredVideos = computed(() => {
  const now = new Date();

  return newsVideos.value.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    if (!matchesSearch) return false;

    if (timeFilter.value === 'all') return true;

    const publishedDate = new Date(video.publishedAtRaw || Date.now());
    const diffDays = Math.ceil(Math.abs(now - publishedDate) / (1000 * 60 * 60 * 24));

    if (timeFilter.value === 'week') return diffDays <= 7;
    if (timeFilter.value === 'month') return diffDays <= 30;

    return true;
  });
});

const featuredVideo = computed(() => filteredVideos.value[0] || null);
const secondaryVideos = computed(() => filteredVideos.value.slice(1));

onMounted(() => {
  loadNews();
});
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header & Filter Bar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
      <div>
        <h2 class="text-2xl font-black text-white tracking-tight">
          Spartan Daily News
        </h2>
        <p class="text-xs text-slate-400">
          Morning broadcasts and daily announcements from @spartannewsdaily8847
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
            placeholder="Search news..." 
            class="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Refresh Button -->
        <button 
          @click="loadNews" 
          class="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          title="Refresh Feed"
        >
          <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="space-y-6">
      <div class="w-full aspect-[21/9] bg-slate-900 animate-pulse rounded-2xl border border-slate-800"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="aspect-video bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div v-else-if="filteredVideos.length > 0" class="space-y-8">
      <!-- Featured Video Banner -->
      <div v-if="featuredVideo" class="relative bg-slate-900 border border-blue-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12">
          <router-link 
            :to="`/live?v=${featuredVideo.id}`" 
            class="lg:col-span-7 relative aspect-video bg-slate-950 overflow-hidden group"
          >
            <img 
              :src="featuredVideo.thumbnail" 
              :alt="featuredVideo.title" 
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <div class="w-14 h-14 rounded-full bg-sparta-blue text-white flex items-center justify-center shadow-lg">
                <Play class="w-7 h-7 fill-current ml-0.5" />
              </div>
            </div>
            <span class="absolute top-3 left-3 bg-sparta-blue text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
              <Sparkles class="w-3 h-3" /> Latest Broadcast
            </span>
          </router-link>

          <div class="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar class="w-3.5 h-3.5 text-blue-400" /> Published {{ featuredVideo.publishedAt }}
              </span>
              <h3 class="text-xl font-extrabold text-white leading-snug">
                {{ featuredVideo.title }}
              </h3>
              <p class="text-xs text-slate-400 line-clamp-4 leading-relaxed">
                {{ featuredVideo.description }}
              </p>
            </div>

            <router-link 
              :to="`/live?v=${featuredVideo.id}`" 
              class="w-full py-2.5 bg-sparta-blue hover:bg-blue-600 text-white font-bold text-xs rounded-lg text-center transition tracking-wide uppercase shadow-lg"
            >
              Watch Full Broadcast
            </router-link>
          </div>
        </div>
      </div>

      <!-- Secondary Videos Grid -->
      <div v-if="secondaryVideos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="video in secondaryVideos"
          :key="video.id"
          :to="`/live?v=${video.id}`"
          class="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl overflow-hidden shadow-lg transition group flex flex-col"
        >
          <div class="relative aspect-video bg-slate-950 overflow-hidden">
            <img 
              :src="video.thumbnail" 
              :alt="video.title" 
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <div class="w-12 h-12 rounded-full bg-sparta-blue text-white flex items-center justify-center shadow-lg">
                <Play class="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
            <h4 class="font-bold text-sm text-white line-clamp-2 group-hover:text-blue-400 transition">
              {{ video.title }}
            </h4>
            <div class="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <Calendar class="w-3.5 h-3.5 text-slate-500" />
              <span>{{ video.publishedAt }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Empty / API Key Error State -->
    <div v-else class="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-xl mx-auto my-12 space-y-2">
      <AlertCircle v-if="apiError" class="w-10 h-10 text-amber-500 mx-auto" />
      <Tv v-else class="w-10 h-10 text-slate-600 mx-auto" />
      <p class="text-sm font-bold text-slate-200">
        {{ apiError ? 'Unable to load YouTube news videos.' : 'No videos found for the selected filter.' }}
      </p>
      <p class="text-xs text-slate-500">
        {{ apiError ? 'Check your VITE_YOUTUBE_API_KEY environment variable in .env.local' : 'Try selecting All Time or clearing your search.' }}
      </p>
    </div>
  </div>
</template>