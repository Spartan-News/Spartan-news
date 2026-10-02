import { createRouter, createWebHistory } from 'vue-router';
import HomeNewsView from '../views/HomeNewsView.vue';
import ActiveLiveView from '../views/ActiveLiveView.vue';
import PastLivesView from '../views/PastLivesView.vue';
import ScoreboardView from '../views/ScoreboardView.vue';
import SubscribeView from '../views/SubscribeView.vue';
import PollsView from '../views/PollsView.vue';
import AdminPollsView from '../views/AdminPollsView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeNewsView },
  { path: '/live', name: 'ActiveLive', component: ActiveLiveView },
  { path: '/pastlives', name: 'PastLives', component: PastLivesView },
  { path: '/scoreboard', name: 'Scoreboard', component: ScoreboardView },
  { path: '/subscribe', name: 'Subscribe', component: SubscribeView },
  { path: '/polls', name: 'Polls', component: PollsView },
  { path: '/admin/polls', name: 'AdminPolls', component: AdminPollsView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;