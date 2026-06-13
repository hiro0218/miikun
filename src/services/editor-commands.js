import { EventBus } from '@/shared/event-bus';

export const registerEditorCommands = ({
  undo,
  redo,
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
  EventBus.$on('newFile', newFile);
  EventBus.$on('openFile', openFile);
  EventBus.$on('saveFile', saveFile);
  EventBus.$on('saveAs', saveAs);
  EventBus.$on('closeTab', closeTab);
  EventBus.$on('nextTab', nextTab);
  EventBus.$on('prevTab', prevTab);
};
