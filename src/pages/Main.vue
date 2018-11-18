<template>
  <div class="container"><toolbar /> <editor ref="miiEditor" /></div>
</template>

<script>
import Toolbar from '@/components/Toolbar';
import Editor from '@/components/Editor';

export default {
  name: 'MiiMain',
  components: {
    Toolbar,
    Editor,
  },
};
</script>

<style scoped>
.container {
  display: flex;
  background: #fff;
}
</style>
