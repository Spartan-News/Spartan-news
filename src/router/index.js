import { createRouter, createWebHistory } from 'vue-router'
import HomeNewsView from '../views/HomeNewsView.vue'
import ActiveLiveView from '../views/ActiveLiveView.vue'
import PastLivesView from '../views/PastLivesView.vue'
import ScoreboardView from '../views/ScoreboardView.vue'
import SubscribeView from '../views/SubscribeView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import AdminScheduleView from '../views/AdminScheduleView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ShortUrlView from '../views/ShortUrlView.vue'
import HudlHighlightsView from '../views/HudlHighlightsView.vue'
import TermsView from '../views/TermsView.vue'
import CookiePolicyView from '../views/CookiePolicyView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeNewsView },
  { path: '/live', name: 'ActiveLive', component: ActiveLiveView },
  { path: '/shorturl', name: 'ShortUrl', component: ShortUrlView },
  { path: '/pastlives', name: 'PastLives', component: PastLivesView },
  { path: '/scoreboard', name: 'Scoreboard', component: ScoreboardView },
  { path: '/highlights', name: 'Highlights', component: HudlHighlightsView },
  { path: '/terms', name: 'Terms', component: TermsView },
  { path: '/cookie-policy', alias: '/cookies', name: 'CookiePolicy', component: CookiePolicyView },
  { 
    path: '/subscribe', 
    name: 'Subscribe', 
    component: SubscribeView,
    beforeEnter: (to, from, next) => {
      // Check for native mobile app platform flags
      const isNativeApp = Boolean(
        window?.Capacitor?.isNativePlatform?.() || 
        window?.cordova || 
        /wv|Android.*Version\/[0-9]\.[0-9]/i.test(navigator.userAgent)
      )

      if (isNativeApp) {
        // Redirect mobile app users back to home
        next({ name: 'Home' })
      } else {
        next()
      }
    }
  },
  { path: '/admin/users', name: 'AdminUsers', component: AdminUsersView },
  { path: '/admin/schedule', name: 'AdminSchedule', component: AdminScheduleView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
