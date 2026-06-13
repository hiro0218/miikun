import { EventBus } from '@/shared/event-bus';

export const registerEditorCommands = ({
  undo,
  redo,
  setHeadingLevel,
  toggleBold,
  insertLink,
  toggleBulletList,
  newFile,
  openFile,
  saveFile,
  saveAs,
  closeTab,
  nextTab,
  prevTab,
}) => {
  EventBus.$on('undo', undo);
  EventBus.$on('redo', redo);
  EventBus.$on('setHeadingLevel', setHeadingLevel);
  EventBus.$on('toggleBold', toggleBold);
  EventBus.$on('insertLink', insertLink);
  EventBus.$on('toggleBulletList', toggleBulletList);
  EventBus.$on('newFile', newFile);
  EventBus.$on('openFile', openFile);
  EventBus.$on('saveFile', saveFile);
  EventBus.$on('saveAs', saveAs);
  EventBus.$on('closeTab', closeTab);
  EventBus.$on('nextTab', nextTab);
  EventBus.$on('prevTab', prevTab);
};
