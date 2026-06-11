import { createRouter, createWebHistory } from 'vue-router';
import Main from '@/pages/Main.vue';

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mii-main',
      component: Main,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
