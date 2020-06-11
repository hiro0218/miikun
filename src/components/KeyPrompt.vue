<template>
  <div v-show="enable" class="keyprompt">
    <div class="keyprompt-container">
      <div class="headline">
        {{ title }}
      </div>
      <div>
        <input v-model="key" type="password" placeholder="Enter a password to encrypt the file." maxlength="50" />
      </div>
      <div>
        <button @click="done">OK</button>
        <button @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeyPrompt',
  data: function () {
    return {
      title: '',
      rules: {
        required: (value) => !!value || 'Required.',
      },
    };
  },
  computed: {
    enable: {
      get: function () {
        return this.$store.state.Editor.crypt.enable;
      },
      set: function (v) {
        this.$store.dispatch('setCryptEnable', v);
      },
    },
    key: {
      get: function () {
        return this.$store.state.Editor.crypt.key;
      },
      set: function (v) {
        this.$store.dispatch('setCryptKey', v);
      },
    },
  },
  watch: {
    enable: function (value) {
      if (value) this.onOpen();
    },
  },
  methods: {
    done() {
      this.enable = false;
      this.$emit('done', this.key);
    },
    cancel() {
      this.enable = false;
      this.$emit('done', null);
    },
    onOpen() {
      let fname = this.$store.state.Editor.crypt.op.path;
      let opname = this.$store.state.Editor.crypt.op.name;

      if (typeof fname === 'string' && typeof opname === 'string') {
        fname = fname.split('/').pop();
        opname = opname.charAt(0).toUpperCase() + opname.slice(1);
        this.title = opname + ' ' + fname;
      } else {
        // Unexpected situation
        this.title = 'Unkown operation';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.keyprompt {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.33);
}

.keyprompt-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 50vw;
  height: 300px;
  margin: auto;
  background: #fff;
}
</style>
