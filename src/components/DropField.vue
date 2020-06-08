<template>
  <div class="dropfield" />
</template>

<script>
import { getSelectedResult } from '@/modules/dialog.js';

export default {
  name: 'DropField',
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
          const ext = file.name.split('.')[1];
          if (process.env.NODE_ENV === 'development') console.log(file);
          this.dropFile(file, ext);
        },
        true,
      );
    },
    dropFile(file, ext) {
      if (this.isAllowExt(file.type, ext)) {
        this.$parent.saveModifyFile();
        if (ext === 'mii') {
          this.$parent.openKeyPrompt('open', file.path);
        } else {
          this.$parent.readFile(file.path);
        }
      } else {
        getSelectedResult({
          title: 'error',
          type: 'error',
          buttons: ['OK'],
          message: file.path,
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
  padding: 2rem;
  transition: opacity 0.4s ease;
  border: 4px dashed #bdbdbd;
  opacity: 0;
  background: rgba(0, 0, 0, 0.12);
  color: #fff;
  font-size: 4rem;
  user-select: none;

  &::before {
    content: 'Drop file here';
  }
}
</style>
