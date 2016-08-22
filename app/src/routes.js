import Vue from 'vue'

export default {
  '/': {
    component: Vue.component('main-page', require('./components/Main')),
    name: 'main-page'
  }
}
