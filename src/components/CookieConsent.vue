<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { readCookieConsent, saveCookieConsent } from '../services/cookieConsent.js';

const isVisible = ref(false);

function openSettings() {
  isVisible.value = true;
}

function choose(analytics) {
  saveCookieConsent(analytics);
  isVisible.value = false;
}

onMounted(() => {
  isVisible.value = !readCookieConsent();
  window.addEventListener('spartan-cookie-settings', openSettings);
});

onUnmounted(() => window.removeEventListener('spartan-cookie-settings', openSettings));
</script>

<template>
  <section
    v-if="isVisible"
    class="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-blue-300/40 bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:inset-x-6 sm:bottom-6 sm:p-6"
    role="dialog"
    aria-labelledby="cookie-title"
    aria-describedby="cookie-description"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="max-w-xl">
        <p class="mb-1 text-xs font-black uppercase tracking-[0.18em] text-sparta-blue dark:text-sparta-gold">A tiny site note</p>
        <h2 id="cookie-title" class="text-xl font-black">Do you accept our yummy cookies?</h2>
        <p id="cookie-description" class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Analytics cookies help us see which pages are popular. The essential site bits work either way. Your choice lasts 180 days.
          <router-link to="/cookies" class="font-bold text-blue-700 underline dark:text-blue-300">Cookie details</router-link>
        </p>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <button type="button" @click="choose(false)" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
          No thanks, plain biscuit
        </button>
        <button type="button" @click="choose(true)" class="rounded-lg bg-sparta-blue px-3 py-2 text-sm font-bold text-white hover:bg-blue-800">
          Yes, yummy cookies!
        </button>
      </div>
    </div>
  </section>
</template>
