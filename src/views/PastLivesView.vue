<template>
  <div class="past-lives-container max-w-7xl mx-auto px-4 py-6">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-white">Past Live Streams</h1>
      <p class="text-slate-400 mt-1">Watch archived live broadcasts, sports events, and live stream replays.</p>
    </header>

    <!-- Error State -->
    <div v-if="errorMessage" class="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-xl mb-6">
      <p class="font-medium">{{ errorMessage }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="bg-slate-800/50 rounded-xl h-64 animate-pulse border border-slate-700/50"></div>
    </div>

    <!-- Video Grid -->
    <div v-else-if="videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="video in videos" 
        :key="video.id"
        class="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
        @click="playVideo(video)"
      >
        <div class="relative aspect-video overflow-hidden bg-slate-900">
          <img 
            :src="video.thumbnail" 
            :alt="video.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <!-- Play Icon -->
            <div class="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div class="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-1 rounded text-slate-200 font-mono">
            {{ video.publishedAt }}
          </div>
        </div>

        <div class="p-4">
          <h3 class="text-base font-semibold text-white line-clamp-2 group-hover:text-sky-400 transition-colors">
            {{ video.title }}
          </h3>
          <p class="text-xs text-slate-400 mt-2 line-clamp-2">
            {{ video.description || 'No description available.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800">
      <p class="text-slate-400">No past live streams found.</p>
    </div>

    <!-- Embedded Video Modal Player -->
    <div 
      v-if="activeVideo" 
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeVideo"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div class="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 class="text-lg font-semibold text-white truncate pr-4">{{ activeVideo.title }}</h2>
          <button 
            class="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
            @click="closeVideo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="relative aspect-video w-full bg-black">
          <iframe 
            :src="`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`" 
            class="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>

        <div class="p-4 bg-slate-900/90 text-sm text-slate-300 max-h-36 overflow-y-auto">
          <p class="whitespace-pre-line">{{ activeVideo.description || 'No description provided.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const videos = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const activeVideo = ref(null)

const API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'https://noti.router.app.shsnews.live'

onMounted(async () => {
  await fetchPastStreams()
})

async function fetchPastStreams() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Query handle for live stream channel
    const res = await fetch(`${API_BASE_URL}/youtube-feed?handle=SpartanNewsLive`)
    if (!res.ok) {
      throw new Error(`Failed to fetch live streams (Status ${res.status})`)
    }

    const data = await res.json()
    if (data.error) {
      errorMessage.value = data.error
    }

    // Exclude daily news uploads if both handles share a playlist
    const rawItems = data.items || []
    videos.value = rawItems.filter(item => {
      const titleLower = (item.title || '').toLowerCase()
      return !titleLower.includes('spartan news 10-') && !titleLower.includes('spartan news 9-')
    })

    // Fallback if filtering removed all items
    if (videos.value.length === 0 && rawItems.length > 0) {
      videos.value = rawItems
    }
  } catch (err) {
    console.error('Error loading past streams:', err)
    errorMessage.value = 'Unable to load past live streams.'
  } finally {
    isLoading.value = false
  }
}

function playVideo(video) {
  if (video.isLive) {
    router.push({ name: 'active-live', query: { v: video.id } })
    return
  }

  activeVideo.value = video
}

function closeVideo() {
  activeVideo.value = null
}
</script>