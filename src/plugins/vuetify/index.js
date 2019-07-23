import Vue from 'vue';

import Vuetify, {
  VApp, // required
  VBtn,
  VCard,
  VDialog,
  VFadeTransition,
} from 'vuetify/lib';
import { Ripple } from 'vuetify/lib/directives';

import './index.styl';

Vue.use(Vuetify, {
  components: {
    VApp,
    VBtn,
    VCard,
    VDialog,
    VFadeTransition,
  },
  directives: {
    Ripple,
  },
});
