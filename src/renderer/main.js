import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';

import { MdButton, MdIcon } from 'vue-material/dist/components';
Vue.use(MdButton);
Vue.use(MdIcon);
import 'vue-material/dist/vue-material.min.css';

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
