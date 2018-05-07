import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'mii-main',
      component: require('@/components/Main').default
    },
    {
      path: '/ask-encrypt-key',
      name: 'mii-encrypt-key-prompt',
      component: require('@/components/EncryptKeyPrompt').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
