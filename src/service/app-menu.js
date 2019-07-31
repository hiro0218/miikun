import electron from 'electron';
const { remote } = electron;
const { shell, Menu, MenuItem } = remote;

import AppMenuList from '@/modules/menu';

export default {
  menuInstance: null,
  setupAppMenu() {
    Menu.setApplicationMenu(null);
    this.menuInstance = Menu.buildFromTemplate(AppMenuList.appmMenuList);
    Menu.setApplicationMenu(this.menuInstance);
  },
  setupContextMenu() {
    window.addEventListener(
      'contextmenu',
      e => {
        e.preventDefault();

        const menu = new Menu();
        const selectText = window
          .getSelection()
          .toString()
          .replace(/\n+/g, ' ');

        if (selectText) {
          menu.append(
            new MenuItem({
              label:
                'Search Google for "' + (selectText.length > 20 ? selectText.substr(0, 17) + '...' : selectText) + '"',
              click: function() {
                shell.openExternal('https://www.google.com/search?q=' + encodeURIComponent(selectText));
              },
            }),
          );
          menu.append(
            new MenuItem({
              type: 'separator',
            }),
          );
        }

        menu.append(
          new MenuItem({
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          }),
        );

        menu.popup({ window: remote.getCurrentWindow() });
      },
      false,
    );
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
