<template>
  <div v-show="enable" class="keyprompt">
    <div class="keyprompt-dialog">
      <div class="keyprompt-dialog__title">{{ title }}</div>
      <div class="keyprompt-dialog__form">
        <input
          v-model="key"
          type="password"
          class="keyprompt-dialog__input"
          placeholder="Enter a password to encrypt the file."
          maxlength="50"
        />
      </div>
      <div>
        <button class="keyprompt-dialog__button--ok" @click="done">OK</button>
        <button class="keyprompt-dialog__button--cancel" @click="cancel">Cancel</button>
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
  z-index: 5;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.33);
}

.keyprompt-dialog {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  width: 50vw;
  margin: auto;
  padding: 1rem;
  background: #fff;

  &__title {
    margin-bottom: 1rem;
    font-size: $font-size-lg;
  }

  &__form {
    margin-bottom: 1rem;
  }

  &__input {
    width: 100%;
    min-height: 2rem;
    padding: 0.25rem 0.5rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    border: 1px solid #d1d5da;
    border-radius: 3px;
    outline: none;
    background-color: #fff;
    box-shadow: inset 0 1px 2px rgba(27, 31, 35, 0.075);
    color: #24292e;
    font-size: 16px;
    line-height: 20px;
    vertical-align: middle;

    &:focus {
      border-color: $oc-blue-6;
      outline: none;
      box-shadow: inset 0 1px 2px rgba(27, 31, 35, 0.075), 0 0 0 0.2em rgba($oc-blue-8, 0.3);
    }
  }

  &__button {
    $element: #{&};

    display: inline-block;
    padding: 6px 12px;
    transition: background-color 0.15s ease-in-out;
    border: 1px solid rgba(27, 31, 35, 0.2);
    border-radius: 0.25em;
    color: #fff;
    font-size: $font-size-sm;
    line-height: 20px;
    vertical-align: middle;
    white-space: nowrap;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    -webkit-appearance: none;
    appearance: none;

    & + & {
      margin-left: 0.5rem;
    }

    &--ok {
      @extend #{$element};

      border-color: $oc-blue-7;
      background-color: $oc-blue-7;

      &:hover {
        border-color: $oc-blue-8;
        background-color: $oc-blue-8;
      }
    }

    &--cancel {
      @extend #{$element};

      border-color: $oc-gray-5;
      background-color: $oc-gray-5;

      &:hover {
        border-color: $oc-gray-6;
        background-color: $oc-gray-6;
      }
    }
  }
}
</style>
