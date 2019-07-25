import electron from 'electron';
const { remote } = electron;
const { Menu } = remote;

import AppMenuList from '@/modules/menu';

export default {
  menuInstance: null,
  init() {
    Menu.setApplicationMenu(null);
    this.menuInstance = Menu.buildFromTemplate(AppMenuList.menubar);
    Menu.setApplicationMenu(this.menuInstance);
  },
  getInstance() {
    return this.menuInstance;
  },
  getMenuItemById(menuId) {
    return this.menuInstance.getMenuItemById(menuId);
  },
  checkedMenuItem(menuId, state) {
    const appMenuItem = this.getMenuItemById(menuId);
    if (appMenuItem) appMenuItem.checked = state;
  },
};
