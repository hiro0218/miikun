import { library } from '@fortawesome/fontawesome-svg-core';
import { faUndo, faRedo, faEye, faEyeSlash, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faUndo, faRedo, faEye, faEyeSlash, faCog);

export default function setupFontAwesome(app) {
  app.component('FontAwesomeIcon', FontAwesomeIcon);
}
