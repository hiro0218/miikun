import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';

import { MdButton, MdIcon, MdDialog, MdField, MdDialogPrompt } from 'vue-material/dist/components';
Vue.use(MdButton);
Vue.use(MdIcon);

/* Required by MdDialogPrompt */
Vue.use(MdField);
Vue.use(MdDialog);
Vue.use(MdDialogPrompt);

import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

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
