<template>
  <div class="dropfield" />
</template>

<script>
import { webUtils } from 'electron';
import { getSelectedResult } from '@/modules/dialog.js';

export default {
  name: 'DropField',
  emits: ['open-file-path'],
  mounted: function () {
    this.init();
  },
  methods: {
    init: function () {
      this.setOverlay();

      window.addEventListener(
        'drop',
        (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file) return;
          const ext = file.name.split('.')[1];
          this.dropFile(file, ext);
        },
        true,
      );
    },
    dropFile(file, ext) {
      // Electron >= 32 removed File.path; webUtils is the supported way to get it.
      const path = webUtils.getPathForFile(file);
      if (this.isAllowExt(file.type, ext)) {
        // Editor determines encryption from the emitted path.
        this.$emit('open-file-path', path);
      } else {
        getSelectedResult({
          title: 'error',
          type: 'error',
          buttons: ['OK'],
          message: path,
          detail: 'This file format is not supported.',
        });
      }
    },
    setOverlay: function () {
      const dropZone = document.querySelector('.dropfield');

      window.addEventListener('dragenter', function (e) {
        dropZone.style.opacity = 1;
        dropZone.style.zIndex = 100;
      });

      dropZone.addEventListener('dragleave', function (e) {
        this.style.opacity = null;
        this.style.zIndex = null;
      });

      dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.opacity = null;
        this.style.zIndex = null;
      });

      document.addEventListener('dragstart', function (e) {
        e.preventDefault();
      });

      window.addEventListener('dragover', function (e) {
        e.preventDefault();
      });
    },
    isAllowExt(type, ext) {
      return type === 'text/plain' || type === 'application/text' || ext === 'txt' || ext === 'md' || ext === 'mii';
    },
  },
};
</script>

<style lang="scss" scoped>
.dropfield {
  display: flex;
  position: fixed;
  z-index: -100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease-out;
  outline: 2px dashed var(--accent);
  outline-offset: -16px;
  opacity: 0;
  background: var(--overlay);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  user-select: none;

  &::before {
    content: 'Drop file here';
  }
}
</style>
