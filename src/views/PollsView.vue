<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
        Spartan Student Voice & Polls
      </h1>
      <p class="text-slate-600 dark:text-slate-400 text-sm">
        Vote on active questions and see real-time community results!
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12 text-slate-500 dark:text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent mb-2"></div>
      <p class="text-sm font-semibold">Loading current poll...</p>
    </div>

    <!-- No Active Poll -->
    <div v-else-if="!activePoll" class="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
      <p class="text-slate-600 dark:text-slate-300 font-semibold">There are no active polls right now.</p>
      <p class="text-xs text-slate-400 mt-1">Check back later for new Spartan community questions!</p>
    </div>

    <!-- Active Poll Container -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
        <span class="px-3 py-1 bg-[#003366] text-white text-xs font-bold uppercase rounded-full tracking-wider">
          Active Poll
        </span>
        <span v-if="activePoll.type === 'native'" class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total Votes: {{ totalVotes }}
        </span>
      </div>

      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">
          {{ activePoll.question }}
        </h2>
      </div>

      <!-- TYPE 1: GOOGLE FORM EMBED -->
      <div v-if="activePoll.type === 'google_form'" class="space-y-4">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          This poll is hosted via Google Forms. Complete the form below or open it directly in a new window.
        </p>
        
        <iframe 
          :src="activePoll.googleFormUrl" 
          class="w-full h-[600px] border-0 rounded-lg bg-white"
          loading="lazy"
        ></iframe>

        <div class="text-center pt-2">
          <a 
            :href="activePoll.googleFormUrl" 
            target="_blank" 
            class="text-xs font-bold text-[#003366] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Open in Google Forms Direct Window &rarr;
          </a>
        </div>
      </div>

      <!-- TYPE 2: NATIVE VOTING -->
      <div v-else-if="!hasVoted" class="space-y-3">
        <button
          v-for="(option, index) in activePoll.options"
          :key="index"
          @click="submitVote(index)"
          :disabled="isSubmitting"
          class="w-full text-left px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-[#003366] dark:hover:border-blue-400 transition font-semibold text-slate-800 dark:text-slate-100 flex justify-between items-center group disabled:opacity-50"
        >
          <span>{{ option.label }}</span>
          <Vote class="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#003366] dark:text-blue-400 transition" />
        </button>
      </div>

      <!-- Live Results -->
      <div v-else class="space-y-4">
        <div v-for="(option, index) in activePoll.options" :key="index" class="space-y-1">
          <div class="flex justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
            <span>{{ option.label }}</span>
            <span>{{ getPercentage(option.votes) }}% ({{ option.votes }})</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              class="bg-[#003366] dark:bg-blue-500 h-3 rounded-full transition-all duration-500"
              :style="{ width: getPercentage(option.votes) + '%' }"
            ></div>
          </div>
        </div>

        <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center pt-2">
          ✓ Your vote has been recorded!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { Vote } from 'lucide-vue-next';
import { db } from '../services/firebase.js';
import { collection, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

const activePoll = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const hasVoted = ref(false);
let unsubscribe = null;

const totalVotes = computed(() => {
  if (!activePoll.value || !activePoll.value.options) return 0;
  return activePoll.value.options.reduce((sum, opt) => sum + opt.votes, 0);
});

const getPercentage = (votes) => {
  if (totalVotes.value === 0) return 0;
  return Math.round((votes / totalVotes.value) * 100);
};

const submitVote = async (index) => {
  if (!activePoll.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const pollRef = doc(db, 'polls', activePoll.value.id);
    const updatedOptions = [...activePoll.value.options];
    updatedOptions[index].votes += 1;

    await updateDoc(pollRef, {
      options: updatedOptions
    });

    hasVoted.value = true;
    localStorage.setItem(`voted_${activePoll.value.id}`, 'true');
  } catch (err) {
    console.error('Error submitting vote:', err);
  } finally {
    isSubmitting.value = false;
  }
};

// Listen to Firestore active poll in real time
const q = query(collection(db, 'polls'), where('isActive', '==', true));
unsubscribe = onSnapshot(q, (snapshot) => {
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    activePoll.value = { id: docData.id, ...docData.data() };

    if (localStorage.getItem(`voted_${activePoll.value.id}`)) {
      hasVoted.value = true;
    }
  } else {
    activePoll.value = null;
  }
  isLoading.value = false;
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>