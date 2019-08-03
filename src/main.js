import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import VueElectron from 'vue-electron';
Vue.use(VueElectron);

Vue.config.productionTip = false;

// vue-meta
import './plugins/vue-meta/index';

// vuetify
import './plugins/vuetify/index';

// codemirror
import './plugins/codemirror/index';

// fontawesome
import './plugins/fontawesome/index';

// Miikun Menu
import appMenu from './service/app-menu';

new Vue({
  router,
  store,
  mounted() {
    appMenu.setupAppMenu();
    appMenu.setupContextMenu();
  },
  render: h => h(App),
}).$mount('#app');
