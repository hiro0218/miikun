<template>
  <div>
    <div class="dropzone"/>
  </div>
</template>

<script>
import { getSelectedResult } from '@/modules/dialog.js';

export default {
  name: 'DropField',
  mounted: function() {
    this.init();
  },
  methods: {
    init: function() {
      this.dropOverlay();

      window.addEventListener(
        'drop',
        e => {
          e.preventDefault();
          let file = e.dataTransfer.files[0];
          let ext = file.name.split('.')[1];
          if (process.env.NODE_ENV === 'development') console.log(file);
          this.dropFile(file, ext);
        },
        true,
      );
    },
    dropFile(file, ext) {
      if (
        file.type === 'text/plain' ||
        file.type === 'application/text' ||
        ext === 'txt' ||
        ext === 'md' ||
        ext === 'mii'
      ) {
        this.$parent.readFile(file.path);
      } else {
        getSelectedResult({
          title: 'error',
          type: 'error',
          buttons: ['OK'],
          detail: 'This file format is not supported.',
        });
      }
    },
    dropOverlay: function() {
      let dropZone = document.querySelector('.dropzone');

      window.addEventListener('dragenter', function(e) {
        dropZone.style.opacity = 1;
        dropZone.style.zIndex = 100;
      });

      dropZone.addEventListener('dragleave', function(e) {
        this.style.opacity = null;
        this.style.zIndex = null;
      });

      dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.opacity = null;
        this.style.zIndex = null;
      });

      document.addEventListener('dragstart', function(e) {
        e.preventDefault();
      });

      window.addEventListener('dragover', function(e) {
        e.preventDefault();
      });
    },
  },
};
</script>

<style scoped>
</style>
