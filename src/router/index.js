import { createRouter, createWebHistory } from 'vue-router'
import HomeNewsView from '../views/HomeNewsView.vue'
import ActiveLiveView from '../views/ActiveLiveView.vue'
import PastLivesView from '../views/PastLivesView.vue'
import ScoreboardView from '../views/ScoreboardView.vue'
import SubscribeView from '../views/SubscribeView.vue'
import PollsView from '../views/PollsView.vue'
import AdminPollsView from '../views/AdminPollsView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import AdminScheduleView from '../views/AdminScheduleView.vue'
import AccountView from '../views/AccountView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeNewsView },
  { path: '/live', name: 'ActiveLive', component: ActiveLiveView },
  { path: '/pastlives', name: 'PastLives', component: PastLivesView },
  { path: '/scoreboard', name: 'Scoreboard', component: ScoreboardView },
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
  { path: '/polls', name: 'Polls', component: PollsView },
  { path: '/admin/polls', name: 'AdminPolls', component: AdminPollsView },
  { path: '/admin/users', name: 'AdminUsers', component: AdminUsersView },
  { path: '/admin/schedule', name: 'AdminSchedule', component: AdminScheduleView },
  { path: '/account', name: 'Account', component: AccountView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router