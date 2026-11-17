<template>
  <div class="past-lives-container max-w-7xl mx-auto px-4 py-6">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-white">Past Live Streams</h1>
      <p class="text-slate-400 mt-1">Watch archived live broadcasts, sports events, and stream replays.</p>
    </header>

    <div v-if="errorMessage" role="alert" class="mb-6 rounded-xl border border-red-700 bg-red-900/40 p-4 text-red-200"><p class="font-medium">{{ errorMessage }}</p></div>
    <div v-if="isLoading" role="status" class="py-8 text-slate-300">Loading past streams...</div>

    <template v-else-if="videos.length">
      <MediaSearchFilters
        id-prefix="replays"
        search-label="Search replays"
        search-hint="Search video titles and descriptions for teams, sports, or event names."
        v-model:query="draftFilters.query"
        v-model:from-date="draftFilters.fromDate"
        v-model:to-date="draftFilters.toDate"
        @apply="applyFilters"
        @clear="clearFilters"
      />
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" class="text-sm text-slate-300">Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredVideos.length }} replays (latest feed).</p>
        <label for="replay-page-size" class="flex items-center gap-2 text-sm font-semibold text-slate-200">
          Videos per page
          <select id="replay-page-size" v-model.number="pageSize" @change="currentPage = 1" class="min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
            <option :value="6">6</option><option :value="12">12</option><option :value="20">20</option>
          </select>
        </label>
      </div>
      <div v-if="filteredVideos.length" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="video in pageVideos" :key="video.id" class="group overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/80 shadow-lg transition-colors hover:bg-slate-800">
          <div class="relative aspect-video overflow-hidden bg-slate-900">
            <img :src="video.thumbnail" :alt="`Video thumbnail for ${video.title}`" width="640" height="360" loading="lazy" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <time v-if="video.publishedAtRaw" :datetime="video.publishedAtRaw" class="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">{{ video.publishedAt }}</time>
          </div>
          <div class="p-4">
            <h2 class="line-clamp-2 text-base font-semibold text-white">{{ video.title }}</h2>
            <p class="mt-2 line-clamp-3 text-sm text-slate-300">{{ video.description || 'No description available.' }}</p>
            <button type="button" @click="playVideo(video)" :aria-label="`Watch replay: ${video.title}`" class="mt-4 min-h-11 rounded-lg bg-sparta-blue px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Watch replay</button>
          </div>
        </article>
      </div>
      <div v-else class="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
        <p>No replays match those filters.</p>
        <button type="button" @click="clearFilters" class="mt-3 min-h-11 rounded-lg border border-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-800">Clear filters</button>
      </div>
      <nav v-if="pageCount > 1" aria-label="Replay pages" class="mt-6 flex items-center justify-center gap-4">
        <button type="button" :disabled="currentPage === 1" @click="currentPage--" class="min-h-11 rounded-lg border border-slate-600 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
        <span aria-live="polite" class="text-sm text-slate-300">Page {{ currentPage }} of {{ pageCount }}</span>
        <button type="button" :disabled="currentPage >= pageCount" @click="currentPage++" class="min-h-11 rounded-lg border border-slate-600 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Next</button>
      </nav>
    </template>
    <div v-else class="rounded-2xl border border-slate-800 bg-slate-900/50 py-12 text-center text-slate-300"><p>No past live streams found.</p></div>

    <dialog v-if="activeVideo" ref="videoDialog" aria-labelledby="replay-dialog-title" @close="activeVideo = null" class="video-dialog w-[min(92vw,900px)] max-w-none max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-0 text-white shadow-2xl">
      <div class="flex items-center justify-between gap-4 border-b border-slate-700 p-4">
        <h2 id="replay-dialog-title" class="truncate text-lg font-bold">{{ activeVideo.title }}</h2>
        <button type="button" autofocus @click="closeVideo" class="min-h-11 shrink-0 rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Close player</button>
      </div>
      <div class="aspect-video bg-black">
        <iframe :src="`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&cc_load_policy=1`" :title="activeVideo.title" class="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <div class="max-h-40 overflow-y-auto p-4 text-sm text-slate-300">
        <p class="whitespace-pre-line">{{ activeVideo.description || 'No description provided.' }}</p>
        <a :href="`https://www.youtube.com/watch?v=${activeVideo.id}`" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block font-semibold text-blue-300 underline">Open on YouTube for available captions</a>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MediaSearchFilters from '../components/MediaSearchFilters.vue'
import { filterMediaItems } from '../services/mediaFilters.js'

const router = useRouter()
const videos = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const activeVideo = ref(null)
const videoDialog = ref(null)
const draftFilters = ref({ query: '', fromDate: '', toDate: '' })
const appliedFilters = ref({ ...draftFilters.value })
const filteredVideos = computed(() => filterMediaItems(videos.value, appliedFilters.value))
const pageSize = ref(6)
const currentPage = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(filteredVideos.value.length / pageSize.value)))
const pageVideos = computed(() => filteredVideos.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const rangeStart = computed(() => filteredVideos.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0)
const rangeEnd = computed(() => Math.min(currentPage.value * pageSize.value, filteredVideos.value.length))
const API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'https://noti.router.app.shsnews.live'

onMounted(fetchPastStreams)

function applyFilters() { appliedFilters.value = { ...draftFilters.value }; currentPage.value = 1 }
function clearFilters() { draftFilters.value = { query: '', fromDate: '', toDate: '' }; applyFilters() }

async function fetchPastStreams() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/youtube-feed?handle=SpartanNewsLive`)
    if (!response.ok) throw new Error(`Failed to fetch live streams (Status ${response.status})`)
    const data = await response.json()
    if (data.error) errorMessage.value = data.error
    const rawItems = Array.isArray(data.items) ? data.items : []
    const replays = rawItems.filter((item) => {
      const title = (item.title || '').toLowerCase()
      return !title.includes('spartan news 10-') && !title.includes('spartan news 9-')
    })
    videos.value = replays.length || !rawItems.length ? replays : rawItems
  } catch (err) {
    console.error('Error loading past streams:', err)
    errorMessage.value = 'Unable to load past live streams.'
  } finally { isLoading.value = false }
}

async function playVideo(video) {
  if (video.isLive) {
    router.push({ name: 'ActiveLive', query: { v: video.id } })
    return
  }
  activeVideo.value = video
  await nextTick()
  if (videoDialog.value && !videoDialog.value.open) videoDialog.value.showModal()
}

function closeVideo() {
  if (videoDialog.value?.open) videoDialog.value.close()
  else activeVideo.value = null
}
</script>

<style scoped>
.video-dialog::backdrop { background: rgb(0 0 0 / 82%); backdrop-filter: blur(4px); }
</style>
