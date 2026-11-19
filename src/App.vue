<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Radio, Tv, History, Sun, Moon, Trophy, Mail, Play } from 'lucide-vue-next';
import { useTheme } from './services/theme.js';
import { initNotifications } from './services/notifications.js';
import CookieConsent from './components/CookieConsent.vue';

const { isDark, initTheme, toggleTheme } = useTheme();
const isBrowser = ref(true);
const route = useRoute();
const navElement = ref(null);
const navIndicator = ref({ left: 0, width: 0, visible: false });
let navResizeObserver;

async function updateNavIndicator() {
  await nextTick();
  const nav = navElement.value;
  const activeLink = nav?.querySelector('.nav-item.is-active');
  if (!nav || !activeLink) {
    navIndicator.value = { ...navIndicator.value, visible: false };
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const activeRect = activeLink.getBoundingClientRect();
  navIndicator.value = {
    left: activeRect.left - navRect.left - nav.clientLeft + nav.scrollLeft,
    width: activeLink.offsetWidth,
    visible: true,
  };
}

watch(() => route.fullPath, updateNavIndicator, { flush: 'post' });

function openCookieSettings() {
  window.dispatchEvent(new Event('spartan-cookie-settings'));
}

onMounted(() => {
  initTheme();
  initNotifications();
  updateNavIndicator();
  if (navElement.value && typeof ResizeObserver !== 'undefined') {
    navResizeObserver = new ResizeObserver(updateNavIndicator);
    navResizeObserver.observe(navElement.value);
  }

  // Platform check to hide browser-only routes (Subscribe) in mobile apps
  const isCapacitor = Boolean(window?.Capacitor?.isNativePlatform?.());
  const isCordova = Boolean(window?.cordova);
  const isMobileAppUserAgent = /wv|Android.*Version\/[0-9]\.[0-9]/i.test(navigator.userAgent);

  if (isCapacitor || isCordova || isMobileAppUserAgent) {
    isBrowser.value = false;
  }

  // Native installs use the Capacitor SDK; load the web SDK only in browsers.
  const webPushAppId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (isBrowser.value && webPushAppId && !document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId: webPushAppId,
      });
    });
  }
});

onBeforeUnmount(() => navResizeObserver?.disconnect());
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <a href="#route-content" class="skip-to-content">Skip to main content</a>
    <!-- Royal Blue Navigation Header -->
    <header class="holiday-header border-b border-blue-900 bg-sparta-blue dark:bg-sparta-darkblue text-white backdrop-blur sticky top-0 z-50 shadow-md">
      <div class="holiday-lights" aria-hidden="true">
        <span v-for="light in 18" :key="light" class="holiday-light" :style="{ '--light-index': light }"></span>
      </div>
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div class="flex items-center gap-3">
            <img 
              src="https://unavatar.io/youtube/spartannewsdaily8847" 
              alt="Sparta Senior High School News Logo"
              class="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
            />
            <div>
              <h1 class="text-xl font-extrabold tracking-wide text-white">Spartan News</h1>
              <p class="text-xs text-blue-200 font-medium tracking-wider">
                SPARTAN NEWS NETWORK • SPARTA, MI
              </p>
            </div>
          </div>

          <!-- Light / Dark Mode Toggle Button (Mobile) -->
          <button
            @click="toggleTheme" 
            :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            class="sm:hidden p-2 bg-black/30 dark:bg-black/60 border border-white/20 text-blue-100 hover:text-white rounded-lg transition"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-300" />
            <Moon v-else class="w-4 h-4 text-white" />
          </button>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Scrollable Navigation Router Links -->
          <nav ref="navElement" aria-label="Primary navigation" class="primary-nav flex items-center gap-1.5 bg-black/30 dark:bg-black/60 border border-white/20 p-1.5 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-none w-full sm:w-auto">
            <span
              class="nav-active-indicator"
              :class="{ 'is-visible': navIndicator.visible }"
              :style="{ left: `${navIndicator.left}px`, width: `${navIndicator.width}px` }"
              aria-hidden="true"
            ></span>
            <router-link 
              to="/" 
              class="nav-item px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white shrink-0"
              active-class="is-active"
              exact-active-class="is-active"
            >
              <Tv class="w-3.5 h-3.5" /> Daily News
            </router-link>

            <router-link
              to="/highlights"
              class="nav-item px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white shrink-0"
              active-class="is-active"
            >
              <Play class="w-3.5 h-3.5 text-amber-300" /> Highlights
            </router-link>

            <router-link
              to="/scoreboard" 
              class="nav-item px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white shrink-0"
              active-class="is-active"
            >
              <Trophy class="w-3.5 h-3.5 text-amber-400" /> Scores
            </router-link>

            <router-link 
              to="/live" 
              class="nav-item px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white shrink-0"
              active-class="is-active"
            >
              <Radio class="w-3.5 h-3.5 text-red-600" /> Active Stream
            </router-link>

            <router-link 
              to="/pastlives" 
              class="nav-item px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white shrink-0"
              active-class="is-active"
            >
              <History class="w-3.5 h-3.5" /> Past Streams
            </router-link>

            <!-- Subscribe Link: Rendered ONLY in web browser builds -->
            <router-link 
              v-if="isBrowser"
              to="/subscribe" 
              class="nav-item px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 text-blue-100 hover:text-white shrink-0"
              active-class="is-active"
            >
              <Mail class="w-3.5 h-3.5 text-emerald-400" /> Subscribe
            </router-link>

          </nav>

          <!-- Light / Dark Mode Toggle Button (Desktop) -->
          <button
            @click="toggleTheme" 
            :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            class="hidden sm:block p-2 bg-black/30 dark:bg-black/60 border border-white/20 text-blue-100 hover:text-white rounded-lg transition shrink-0"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-300" />
            <Moon v-else class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>

    <main id="route-content" tabindex="-1" class="seasonal-main max-w-7xl mx-auto px-4 py-8">
      <router-view />
    </main>

    <footer class="border-t border-slate-300 dark:border-slate-800 mt-20 py-8 bg-slate-200 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div class="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p class="text-xs font-semibold">Sparta Senior High School • Live Streaming & Broadcast Club</p>
        <div class="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-[11px] text-slate-500">
          <span>Built for Spartan News Network • Sparta, Michigan</span>
          <span>•</span>
          <span>Designed & Coded by Peyton Gordon</span>
          <span>•</span>
          <a href="/sitemap.xml" target="_blank" class="hover:underline text-blue-600 dark:text-blue-400">Sitemap</a>
          <span>•</span>
          <router-link to="/terms" class="hover:underline text-blue-600 dark:text-blue-400">Terms</router-link>
          <span>•</span>
          <router-link to="/cookies" class="hover:underline text-blue-600 dark:text-blue-400">Cookie Policy</router-link>
          <span>•</span>
          <button type="button" @click="openCookieSettings" class="hover:underline text-blue-600 dark:text-blue-400">Cookie settings</button>
        </div>
      </div>
    </footer>
    <CookieConsent v-if="isBrowser" />
  </div>
</template>

<style scoped>
.primary-nav {
  position: relative;
  isolation: isolate;
}

.nav-item {
  position: relative;
  z-index: 1;
}

.nav-item.is-active {
  color: #0033a0;
  font-weight: 800;
}

.nav-active-indicator {
  position: absolute;
  z-index: 0;
  top: 6px;
  bottom: 6px;
  left: 0;
  border-radius: 0.375rem;
  background: white;
  opacity: 0;
  box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
  transition: left 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease;
}

.nav-active-indicator.is-visible {
  opacity: 1;
}

/* Hides scrollbar visual while keeping touch swipe working on mobile */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
