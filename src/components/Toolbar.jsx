import {
  faBold,
  faChevronDown,
  faEye,
  faEyeSlash,
  faLink,
  faListUl,
  faRedo,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';

import Icon from '@/components/Icon.jsx';
import AppMenuController from '@/services/app-menu-controller';
import { useStore } from '@/store';

import './Toolbar.scss';

export default function Toolbar() {
  const store = useStore();
  const {
    isPreview,
    openToolbar,
    canUndo,
    canRedo,
    canPreview,
    activeTabId,
    crypt: { enable: cryptEnable },
  } = store.state.Editor;
  const canEditDocument = activeTabId != null && !cryptEnable;
  const previewButtonTitle = !canPreview ? 'Preview unavailable' : isPreview ? 'Hide preview' : 'Show preview';

  const setHeadingLevel = (event) => {
    const { value } = event.target;
    if (value !== '') {
      AppMenuController.setHeadingLevel(Number(value));
    }
    event.target.value = '';
  };

  return (
    <div className={`toolbar${openToolbar ? ' open' : ''}`}>
      <div className="menu" aria-label="Markdown toolbar">
        <div className="menu-section">
          <button
            type="button"
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo"
            onClick={() => AppMenuController.undo()}
          >
            <Icon definition={faUndo} />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo"
            onClick={() => AppMenuController.redo()}
          >
            <Icon definition={faRedo} />
          </button>
        </div>
        <div className="menu-section">
          <span className={`heading-control${canEditDocument ? '' : ' disabled'}`}>
            <select
              className="heading-select"
              disabled={!canEditDocument}
              aria-label="Heading level"
              title="Heading level"
              defaultValue=""
              onChange={setHeadingLevel}
            >
              <option value="" disabled>
                H
              </option>
              <option value="0">Text</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
            </select>
            <Icon className="heading-control__icon" definition={faChevronDown} />
          </span>
          <button
            type="button"
            disabled={!canEditDocument}
            aria-label="Bold"
            title="Bold"
            onClick={() => AppMenuController.toggleBold()}
          >
            <Icon definition={faBold} />
          </button>
          <button
            type="button"
            disabled={!canEditDocument}
            aria-label="Link"
            title="Link"
            onClick={() => AppMenuController.insertLink()}
          >
            <Icon definition={faLink} />
          </button>
          <button
            type="button"
            disabled={!canEditDocument}
            aria-label="Bulleted list"
            title="Bulleted list"
            onClick={() => AppMenuController.toggleBulletList()}
          >
            <Icon definition={faListUl} />
          </button>
        </div>
        <div className="menu-section">
          <button
            type="button"
            className={isPreview ? 'active' : ''}
            disabled={!canPreview}
            aria-label={previewButtonTitle}
            aria-pressed={isPreview}
            title={previewButtonTitle}
            onClick={() => AppMenuController.togglePreview()}
          >
            <Icon definition={isPreview ? faEye : faEyeSlash} />
          </button>
        </div>
      </div>
    </div>
  );
}
