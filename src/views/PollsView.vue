<template>
  <div class="polls-container max-w-4xl mx-auto px-4 py-6">
    <header class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Student Polls
      </h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Voice your opinion on upcoming Spartan events, themes, and school activities.
      </p>
    </header>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
      {{ errorMessage }}
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="isLoading" class="space-y-6">
      <div v-for="n in 2" :key="n" class="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
        <div class="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        <div class="space-y-2">
          <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Active Polls List -->
    <div v-else-if="polls.length > 0" class="space-y-6">
      <div 
        v-for="poll in polls" 
        :key="poll.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all"
      >
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {{ poll.title }}
        </h2>

        <div class="space-y-3">
          <div 
            v-for="(option, index) in poll.options" 
            :key="index"
            class="relative overflow-hidden rounded-xl border transition-all"
            :class="[
              hasVoted(poll.id)
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40' 
                : 'border-slate-300 dark:border-slate-700 hover:border-sparta-blue dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 cursor-pointer'
            ]"
            @click="!hasVoted(poll.id) && castVote(poll, index)"
          >
            <!-- Progress Fill Bar after voting -->
            <div 
              v-if="hasVoted(poll.id)"
              class="absolute inset-y-0 left-0 bg-blue-500/20 dark:bg-blue-600/30 transition-all duration-500"
              :style="{ width: getPercentage(poll, option.votes) + '%' }"
            ></div>

            <div class="relative z-10 p-4 flex justify-between items-center text-sm font-semibold">
              <span class="text-slate-800 dark:text-slate-200">{{ option.text }}</span>
              
              <!-- Vote percentage count displayed if already voted -->
              <div v-if="hasVoted(poll.id)" class="flex items-center gap-2">
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  ({{ option.votes || 0 }} votes)
                </span>
                <span class="text-sparta-blue dark:text-blue-400 font-bold">
                  {{ getPercentage(poll, option.votes) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Poll Footer Details -->
        <div class="mt-4 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Total Votes: {{ poll.total_votes || 0 }}</span>
          <span v-if="hasVoted(poll.id)" class="text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ Vote Recorded
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
      <p class="text-slate-500 dark:text-slate-400">No active student polls at this time.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'

const polls = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const votedPolls = ref({})

onMounted(async () => {
  loadVotedState()
  await fetchPolls()
})

function loadVotedState() {
  const saved = localStorage.getItem('shs_voted_polls')
  if (saved) {
    try {
      votedPolls.value = JSON.parse(saved)
    } catch (e) {
      votedPolls.value = {}
    }
  }
}

function hasVoted(pollId) {
  return Boolean(votedPolls.value[pollId])
}

async function fetchPolls() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('active', true)

    if (error) throw error

    polls.value = data || []
  } catch (err) {
    console.error('Supabase Fetch Error:', err)
    errorMessage.value = 'Unable to load active polls. Please check connection.'
  } finally {
    isLoading.value = false
  }
}

async function castVote(poll, optionIndex) {
  if (hasVoted(poll.id)) return

  try {
    // Increment option votes locally
    const updatedOptions = poll.options.map((opt, idx) => {
      if (idx === optionIndex) {
        return { ...opt, votes: (opt.votes || 0) + 1 }
      }
      return opt
    })

    const newTotal = (poll.total_votes || 0) + 1

    // Update in Supabase
    const { error } = await supabase
      .from('polls')
      .update({
        options: updatedOptions,
        total_votes: newTotal
      })
      .eq('id', poll.id)

    if (error) throw error

    // Update state
    poll.options = updatedOptions
    poll.total_votes = newTotal

    // Save voted status
    votedPolls.value[poll.id] = true
    localStorage.setItem('shs_voted_polls', JSON.stringify(votedPolls.value))

  } catch (err) {
    console.error('Supabase Write Error:', err)
    alert('Failed to record vote. Please try again.')
  }
}

function getPercentage(poll, votes) {
  if (!poll.total_votes || poll.total_votes === 0) return 0
  return Math.round(((votes || 0) / poll.total_votes) * 100)
}
</script>