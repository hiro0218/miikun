import { useEffect, useRef } from 'react';

import { getPathForFile, getSelectedResult } from '@/adapters/electron';

import './DropField.scss';

const getFileExtension = (name) => {
  const parts = name.split('.');
  if (parts.length < 2) return '';

  return parts.pop().toLowerCase();
};

const isAllowExt = (type, ext) => {
  return type === 'text/plain' || type === 'application/text' || ext === 'txt' || ext === 'md' || ext === 'mii';
};

export default function DropField({ onOpenFilePath }) {
  const dropZoneRef = useRef(null);

  useEffect(() => {
    const dropZone = dropZoneRef.current;

    const resetOverlay = () => {
      dropZone.style.opacity = null;
      dropZone.style.zIndex = null;
    };
    const onWindowDrop = (event) => {
      event.preventDefault();
      Array.from(event.dataTransfer.files as FileList).forEach((file) => {
        const path = getPathForFile(file);
        const ext = getFileExtension(file.name);

        if (isAllowExt(file.type, ext)) {
          onOpenFilePath(path);
          return;
        }

        getSelectedResult({
          title: 'error',
          type: 'error',
          buttons: ['OK'],
          message: path,
          detail: 'This file format is not supported.',
        });
      });
    };
    const onDragEnter = (event) => {
      if (!event.dataTransfer || !event.dataTransfer.types.includes('Files')) return;
      dropZone.style.opacity = 1;
      dropZone.style.zIndex = 100;
    };
    const onDropZoneDrop = (event) => {
      event.preventDefault();
      resetOverlay();
    };
    const onDocumentDragStart = (event) => {
      if (event.target.closest?.('[draggable="true"]')) return;
      event.preventDefault();
    };
    const onDragOver = (event) => {
      event.preventDefault();
    };

    window.addEventListener('drop', onWindowDrop, true);
    window.addEventListener('dragenter', onDragEnter);
    dropZone.addEventListener('dragleave', resetOverlay);
    dropZone.addEventListener('drop', onDropZoneDrop);
    document.addEventListener('dragstart', onDocumentDragStart);
    window.addEventListener('dragover', onDragOver);

    return () => {
      window.removeEventListener('drop', onWindowDrop, true);
      window.removeEventListener('dragenter', onDragEnter);
      dropZone.removeEventListener('dragleave', resetOverlay);
      dropZone.removeEventListener('drop', onDropZoneDrop);
      document.removeEventListener('dragstart', onDocumentDragStart);
      window.removeEventListener('dragover', onDragOver);
    };
  }, [onOpenFilePath]);

  return <div ref={dropZoneRef} className="dropfield" />;
}
