import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';

import Icon from '@/components/Icon.jsx';
import { useStore } from '@/store';

import './TabBar.scss';

const basename = (path) => path.split(/[\\/]/).pop() || path;

export default function TabBar({ onClose, onNewTab, onReorder, onSelect }) {
  const store = useStore();
  const { tabs, activeTabId } = store.state.Editor;
  const scrollerRef = useRef(null);
  const activeTabRef = useRef(null);
  const focusActiveAfterSelect = useRef(false);
  const lastDropTarget = useRef(null);
  const [draggingTabId, setDraggingTabId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const labelFor = (tab) => (tab.path ? basename(tab.path) : `Untitled-${tab.id}`);
  const titleFor = (tab) => {
    const label = tab.path || labelFor(tab);
    return tab.isDirty ? `${label} - Unsaved changes` : label;
  };
  const ariaLabelFor = (tab) => {
    const label = labelFor(tab);
    return tab.isDirty ? `${label}, unsaved changes` : label;
  };
  const closeLabelFor = (tab) => {
    const label = labelFor(tab);
    return tab.isDirty ? `Close ${label} with unsaved changes` : `Close ${label}`;
  };
  const updateOverflow = () => {
    const el = scrollerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };
  const selectTabFromKeyboard = (tab) => {
    if (!tab) return;
    if (tab.id === activeTabId) {
      activeTabRef.current?.focus();
      return;
    }
    focusActiveAfterSelect.current = true;
    onSelect(tab.id);
  };
  const selectAdjacentTab = (step) => {
    if (tabs.length < 2) return;
    const index = tabs.findIndex((tab) => tab.id === activeTabId);
    if (index === -1) return;
    selectTabFromKeyboard(tabs[(index + step + tabs.length) % tabs.length]);
  };
  const selectEdgeTab = (index) => {
    selectTabFromKeyboard(tabs[index]);
  };
  const onWheel = (event) => {
    const el = scrollerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    el.scrollLeft += event.deltaY;
    event.preventDefault();
  };
  const onDragStart = (event, tab) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-miikun-tab', String(tab.id));
    setDraggingTabId(tab.id);
  };
  const onDragOver = (event, tab) => {
    if (draggingTabId == null || draggingTabId === tab.id) return;
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;

    if (lastDropTarget.current?.id === tab.id && lastDropTarget.current?.after === after) return;
    lastDropTarget.current = { id: tab.id, after };
    onReorder({ id: draggingTabId, targetId: tab.id, after });
  };
  const onDragEnd = () => {
    setDraggingTabId(null);
    lastDropTarget.current = null;
  };

  useEffect(() => {
    const activeTab = activeTabRef.current;
    activeTab?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    if (focusActiveAfterSelect.current) {
      activeTab?.focus();
      focusActiveAfterSelect.current = false;
    }
  }, [activeTabId]);

  useEffect(() => {
    const observer = new ResizeObserver(updateOverflow);
    const scroller = scrollerRef.current;
    if (scroller) observer.observe(scroller);
    updateOverflow();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    updateOverflow();
  }, [tabs.length]);

  return (
    <div className="tabbar">
      <div className={`tabbar-scroll${canScrollLeft ? ' fade-left' : ''}${canScrollRight ? ' fade-right' : ''}`}>
        <div ref={scrollerRef} className="tabbar-tabs" role="tablist" onScroll={updateOverflow} onWheel={onWheel}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              ref={tab.id === activeTabId ? activeTabRef : null}
              aria-label={ariaLabelFor(tab)}
              aria-selected={tab.id === activeTabId}
              className={[
                'tab',
                tab.id === activeTabId ? 'active' : '',
                tab.isDirty ? 'dirty' : '',
                tab.id === draggingTabId ? 'dragging' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={titleFor(tab)}
              role="tab"
              draggable="true"
              tabIndex={tab.id === activeTabId ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onAuxClick={(event) => {
                if (event.button !== 1) return;
                event.preventDefault();
                onClose(tab.id);
              }}
              onDragStart={(event) => onDragStart(event, tab)}
              onDragOver={(event) => {
                event.preventDefault();
                onDragOver(event, tab);
              }}
              onDrop={(event) => {
                event.preventDefault();
                onDragEnd();
              }}
              onDragEnd={onDragEnd}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(tab.id);
                } else if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  selectAdjacentTab(-1);
                } else if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  selectAdjacentTab(1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  selectEdgeTab(0);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  selectEdgeTab(tabs.length - 1);
                }
              }}
            >
              <span className="tab-label">{labelFor(tab)}</span>
              {tab.isDirty ? <span className="dirty-dot" aria-hidden="true" /> : null}
              <button
                type="button"
                className="close-btn"
                aria-label={closeLabelFor(tab)}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(tab.id);
                }}
              >
                <Icon definition={faXmark} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="new-tab-btn" aria-label="New tab" onClick={onNewTab}>
        <Icon definition={faPlus} />
      </button>
    </div>
  );
}
