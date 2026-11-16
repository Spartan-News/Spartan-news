<template>
  <section class="max-w-7xl mx-auto" aria-labelledby="hudl-highlights-heading">
    <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-sparta-gold">Sparta Athletics</p>
        <h1 id="hudl-highlights-heading" class="mt-1 text-3xl font-black text-white">Hudl Highlights</h1>
        <p class="mt-2 text-slate-400">Recent highlights from Sparta teams.</p>
      </div>
      <a href="https://fan.hudl.com/usa/mi/sparta/organization/6979/sparta-high-school" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-sky-400 hover:text-sky-300">View Sparta on Hudl</a>
    </header>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="h-52 rounded-xl bg-slate-800/60 animate-pulse border border-slate-700/50"></div>
    </div>
    <div v-else-if="highlights.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <a v-for="highlight in highlights" :key="highlight.id" :href="highlight.url" target="_blank" rel="noopener noreferrer" class="group overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/80 hover:bg-slate-800 transition-colors">
        <div class="aspect-video bg-slate-950 overflow-hidden">
          <img v-if="highlight.thumbnail" :src="highlight.thumbnail" :alt="highlight.title" loading="lazy" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div v-else class="h-full flex items-center justify-center text-slate-600 text-sm font-bold">SPARTA HIGHLIGHT</div>
        </div>
        <div class="p-4">
          <h2 class="font-bold text-white line-clamp-2 group-hover:text-sky-400 transition-colors">{{ highlight.title }}</h2>
          <p class="mt-2 text-xs text-slate-400">{{ highlight.team }}<span v-if="highlight.createdAt"> · {{ formatDate(highlight.createdAt) }}</span></p>
        </div>
      </a>
    </div>
    <p v-else-if="error" role="status" class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">Hudl highlights are temporarily unavailable. Visit Sparta on Hudl to see the latest videos.</p>
    <p v-else class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">No Hudl highlights have been published yet. Check back for new plays.</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { WORKER_URL } from '../services/config.js'

const highlights = ref([])
const loading = ref(true)
const error = ref(false)

onMounted(loadHighlights)

async function loadHighlights() {
  try {
    const response = await fetch(`${WORKER_URL}/hudl-highlights?limit=12`)
    if (!response.ok) throw new Error(`Hudl highlights request failed (status ${response.status}).`)
    const data = await response.json()
    if (!Array.isArray(data.items)) throw new Error('Hudl returned an invalid highlights response.')
    highlights.value = data.items
  } catch (err) {
    console.error('Error loading Hudl highlights:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
