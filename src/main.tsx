import { createRoot } from 'react-dom/client';

import App from './App';
import appMenu from './services/app-menu';

createRoot(document.getElementById('app')).render(<App />);

appMenu.setupAppMenu();
appMenu.setupContextMenu();
