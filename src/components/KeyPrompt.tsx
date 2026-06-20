import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

import { useStore } from '@/store';

import './KeyPrompt.scss';

export default function KeyPrompt({ onDone }) {
  const store = useStore();
  const inputId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [title, setTitle] = useState('');
  const enable = store.state.Editor.crypt.enable;
  const key = store.state.Editor.crypt.key || '';
  const operationName = store.state.Editor.crypt.op.name;
  const isOpenOperation = operationName === 'open';
  const description =
    operationName === 'open'
      ? 'Enter the password to open the encrypted file.'
      : 'Enter a password to encrypt the file.';
  const actionLabel = isOpenOperation ? 'Unlock' : 'Encrypt';
  const autocomplete = isOpenOperation ? 'current-password' : 'new-password';

  useEffect(() => {
    if (!enable) return;

    const path = store.state.Editor.crypt.op.path;
    const opname = store.state.Editor.crypt.op.name;

    if (typeof path === 'string' && typeof opname === 'string') {
      const fname = path.split(/[\\/]/).pop() || path;
      const operationLabel = opname === 'open' ? 'Unlock' : 'Encrypt';
      setTitle(`${operationLabel} ${fname}`);
      return;
    }

    setTitle('Unknown operation');
  }, [enable, store]);

  useEffect(() => {
    if (!enable) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [enable]);

  const done = () => {
    store.dispatch('setCryptEnable', false);
    onDone(key);
  };

  const cancel = () => {
    store.dispatch('setCryptEnable', false);
    onDone(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    done();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!enable) return null;

  return (
    <div className="keyprompt" onKeyDown={handleKeyDown}>
      <div
        ref={dialogRef}
        className="keyprompt-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div id={titleId} className="keyprompt-dialog__title">
          {title}
        </div>
        <form className="keyprompt-dialog__form" onSubmit={submit}>
          <label className="keyprompt-dialog__label" htmlFor={inputId}>
            Password
          </label>
          <div id={descriptionId} className="keyprompt-dialog__description">
            {description}
          </div>
          <input
            id={inputId}
            ref={inputRef}
            value={key}
            type="password"
            className="keyprompt-dialog__input"
            maxLength={50}
            autoComplete={autocomplete}
            enterKeyHint="done"
            required
            onChange={(event) => store.dispatch('setCryptKey', event.target.value)}
          />
          <div className="keyprompt-dialog__actions">
            <button type="button" className="keyprompt-dialog__button--cancel" onClick={cancel}>
              Cancel
            </button>
            <button type="submit" className="keyprompt-dialog__button--ok">
              {actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
