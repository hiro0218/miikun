import Vue from 'vue';
import Router from 'vue-router';
import Main from '@/components/Main.vue';
import EncryptKeyPrompt from '@/components/KeyPrompt.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'mii-main',
      component: Main,
    },
    {
      path: '/ask-key',
      name: 'mii-key-prompt',
      component: EncryptKeyPrompt,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
