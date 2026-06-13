import { useEffect, useState } from 'react';

import { useStore } from '@/store';

import './KeyPrompt.scss';

export default function KeyPrompt({ onDone }) {
  const store = useStore();
  const [title, setTitle] = useState('');
  const enable = store.state.Editor.crypt.enable;
  const key = store.state.Editor.crypt.key || '';

  useEffect(() => {
    if (!enable) return;

    let fname = store.state.Editor.crypt.op.path;
    let opname = store.state.Editor.crypt.op.name;

    if (typeof fname === 'string' && typeof opname === 'string') {
      fname = fname.split('/').pop();
      opname = opname.charAt(0).toUpperCase() + opname.slice(1);
      setTitle(`${opname} ${fname}`);
      return;
    }

    setTitle('Unkown operation');
  }, [enable, store]);

  const done = () => {
    store.dispatch('setCryptEnable', false);
    onDone(key);
  };
  const cancel = () => {
    store.dispatch('setCryptEnable', false);
    onDone(null);
  };

  if (!enable) return null;

  return (
    <div className="keyprompt">
      <div className="keyprompt-dialog">
        <div className="keyprompt-dialog__title">{title}</div>
        <div className="keyprompt-dialog__form">
          <input
            value={key}
            type="password"
            className="keyprompt-dialog__input"
            placeholder="Enter a password to encrypt the file."
            maxLength="50"
            onChange={(event) => store.dispatch('setCryptKey', event.target.value)}
          />
        </div>
        <div className="keyprompt-dialog__actions">
          <button className="keyprompt-dialog__button--cancel" onClick={cancel}>
            Cancel
          </button>
          <button className="keyprompt-dialog__button--ok" onClick={done}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
