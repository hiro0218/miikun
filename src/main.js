import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import VueElectron from 'vue-electron';
Vue.use(VueElectron);

Vue.config.productionTip = false;

// vuetify
import './plugins/vuetify/index';

// vue-codemirror
import VueCodeMirror from 'vue-codemirror';
Vue.use(VueCodeMirror);

// fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUndo, faRedo, faEye, faEyeSlash, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faUndo, faRedo, faEye, faEyeSlash, faCog);

Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
