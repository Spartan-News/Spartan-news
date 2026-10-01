<script setup>
import { onMounted } from 'vue';
import { Radio, Tv, History, Sun, Moon, Trophy } from 'lucide-vue-next';
import { useTheme } from './services/theme.js';
import { initNotifications } from './services/notifications.js';

const { isDark, initTheme, toggleTheme } = useTheme();

onMounted(() => {
  initTheme();
  initNotifications();
});
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <!-- Royal Blue Navigation Header -->
    <header class="border-b border-blue-900 bg-sparta-blue dark:bg-sparta-darkblue text-white backdrop-blur sticky top-0 z-50 shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <img 
            src="https://yt3.googleusercontent.com/ytc/AIdro_mPFpncvKq3JLkok-3fK49hGC1E8Atfx33UZufJYZX-AB8=s160-c-k-c0x00ffffff-no-rj" 
            alt="Sparta Senior High School News Live Logo" 
            class="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
          />
          <div>
            <h1 class="text-xl font-extrabold tracking-wide text-white">
              Sparta Senior High School News Live
            </h1>
            <p class="text-xs text-blue-200 font-medium tracking-wider">
              SPARTAN NEWS NETWORK • SPARTA, MI
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Navigation Router Links -->
          <nav class="flex items-center gap-1.5 bg-black/30 dark:bg-black/60 border border-white/20 p-1.5 rounded-lg">
            <router-link 
              to="/" 
              class="px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white"
              active-class="bg-white text-sparta-blue font-extrabold shadow"
              exact-active-class="bg-white text-sparta-blue font-extrabold shadow"
            >
              <Tv class="w-3.5 h-3.5" /> Daily News
            </router-link>
            
            <router-link 
              to="/scoreboard" 
              class="px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white"
              active-class="bg-white text-sparta-blue font-extrabold shadow"
            >
              <Trophy class="w-3.5 h-3.5 text-amber-400" /> Scores
            </router-link>

            <router-link 
              to="/live" 
              class="px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white"
              active-class="bg-white text-sparta-blue font-extrabold shadow"
            >
              <Radio class="w-3.5 h-3.5 text-red-600" /> Active Stream
            </router-link>

            <router-link 
              to="/pastlives" 
              class="px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white"
              active-class="bg-white text-sparta-blue font-extrabold shadow"
            >
              <History class="w-3.5 h-3.5" /> Past Streams
            </router-link>
          </nav>

          <!-- Light / Dark Mode Toggle Button -->
          <button 
            @click="toggleTheme" 
            class="p-2 bg-black/30 dark:bg-black/60 border border-white/20 text-blue-100 hover:text-white rounded-lg transition"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-300" />
            <Moon v-else class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <router-view />
    </main>

    <footer class="border-t border-slate-300 dark:border-slate-800 mt-20 py-8 bg-slate-200 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div class="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p class="text-xs font-semibold">Sparta Senior High School • Live Streaming & Broadcast Club</p>
        <div class="flex justify-center items-center gap-4 text-[11px] text-slate-500">
          <span>Built for Spartan News Network • Sparta, Michigan</span>
          <span>•</span>
          <a href="/sitemap.xml" target="_blank" class="hover:underline text-blue-600 dark:text-blue-400">Sitemap</a>
        </div>
      </div>
    </footer>
  </div>
</template>