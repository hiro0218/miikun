import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBold,
  faChevronDown,
  faEye,
  faEyeSlash,
  faLink,
  faListUl,
  faPlus,
  faRedo,
  faUndo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faUndo, faRedo, faEye, faEyeSlash, faXmark, faPlus, faBold, faLink, faListUl, faChevronDown);

export default function setupFontAwesome(app) {
  app.component('FontAwesomeIcon', FontAwesomeIcon);
}
