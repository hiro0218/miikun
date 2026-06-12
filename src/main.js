import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// fontawesome
import setupFontAwesome from './plugins/fontawesome/index';

// Miikun Menu
import appMenu from './services/app-menu';

const app = createApp(App);

app.use(router);
app.use(store);
setupFontAwesome(app);
app.mount('#app');

appMenu.setupAppMenu();
appMenu.setupContextMenu();
