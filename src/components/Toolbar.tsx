import {
  faBold,
  faChevronDown,
  faEye,
  faHashtag,
  faLink,
  faListUl,
  faRedo,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';

import Icon from '@/components/Icon';
import AppMenuController from '@/services/app-menu-controller';
import { useStore } from '@/store';

import './Toolbar.scss';

export default function Toolbar() {
  const store = useStore();
  const {
    isPreview,
    openToolbar,
    showLineNumbers,
    canUndo,
    canRedo,
    canPreview,
    activeTabId,
    crypt: { enable: cryptEnable },
  } = store.state.Editor;
  const canEditDocument = activeTabId != null && !cryptEnable;
  const previewButtonTitle = canPreview ? 'Preview panel' : 'Preview unavailable';
  const lineNumbersButtonTitle = 'Line numbers';

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
        <div className="menu-section" role="group" aria-label="History">
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
        <div className="menu-section" role="group" aria-label="Formatting">
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
        <div className="menu-section menu-section--view" role="group" aria-label="View options">
          <button
            type="button"
            className={showLineNumbers ? 'active' : ''}
            aria-label={lineNumbersButtonTitle}
            aria-pressed={showLineNumbers}
            title={lineNumbersButtonTitle}
            onClick={() => AppMenuController.toggleLineNumbers()}
          >
            <Icon definition={faHashtag} />
          </button>
          <button
            type="button"
            className={isPreview ? 'active' : ''}
            disabled={!canPreview}
            aria-label={previewButtonTitle}
            aria-pressed={isPreview}
            title={previewButtonTitle}
            onClick={() => AppMenuController.togglePreview()}
          >
            <Icon definition={faEye} />
          </button>
        </div>
      </div>
    </div>
  );
}
