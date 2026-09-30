<script setup>
import LiveScoreboard from '../components/LiveScoreboard.vue';
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 py-4">
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-black text-white tracking-tight">
        Spartan Athletics Live Scoreboard
      </h2>
      <p class="text-xs text-slate-400">
        Real-time game tracking powered by Hudl Fan & Sparta High School
      </p>
    </div>

    <!-- Standalone Scoreboard Widget -->
    <LiveScoreboard />
  </div>
</template>