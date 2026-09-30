import { createRouter, createWebHistory } from 'vue-router';
import HomeNewsView from '../views/HomeNewsView.vue';
import ActiveLiveView from '../views/ActiveLiveView.vue';
import PastLivesView from '../views/PastLivesView.vue';
import ScoreboardView from '../views/ScoreboardView.vue';

const routes = [
  { path: '/', name: 'News', component: HomeNewsView },
  { path: '/scoreboard', name: 'Scoreboard', component: ScoreboardView },
  { path: '/live', name: 'Live', component: ActiveLiveView },
  { path: '/pastlives', name: 'PastLives', component: PastLivesView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;