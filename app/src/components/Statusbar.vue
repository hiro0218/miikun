<style scoped>
</style>

<template>
  <div class="statusbar-container">
    <div class="statusbar-left">
      <ul>
        <li>{{path}}</li>
      </ul>
    </div>
    <div class="statusbar-right">
      <ul>
        <li><span class="label">Words: </span>{{words}}</li>
        <li><span class="label">Characters: </span>{{characters}}</li>
        <li><span class="label">Lines: </span>{{lines}}</li>
        <li>{{cursor}} </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'mii-statusbar',
  data () {
    return {
      path: '',
      words: 0,
      characters: 0,
      lines: 0,
      cursor: '0:0'
    }
  }
}
</script>
