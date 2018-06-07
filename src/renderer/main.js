import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
Vue.use(VueMaterial);

import VueCodeMirror from 'vue-codemirror';
Vue.use(VueCodeMirror);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
