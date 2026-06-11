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
      <div class="keyprompt-dialog__actions">
        <button class="keyprompt-dialog__button--cancel" @click="cancel">Cancel</button>
        <button class="keyprompt-dialog__button--ok" @click="done">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeyPrompt',
  emits: ['done'],
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
  display: flex;
  position: fixed;
  z-index: 10;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  background: var(--overlay);
}

.keyprompt-dialog {
  width: min(420px, 90vw);
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);

  &__title {
    margin-bottom: 1rem;
    color: var(--text);
    font-size: $font-size-base;
    font-weight: 600;
  }

  &__form {
    margin-bottom: 1.25rem;
  }

  &__input {
    width: 100%;
    min-height: 2.25rem;
    padding: 0.375rem 0.75rem;
    transition:
      border-color 0.15s ease-out,
      box-shadow 0.15s ease-out;
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: none;
    background-color: var(--bg);
    color: var(--text);
    font-size: $font-size-base;

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--selection);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  &__button--ok,
  &__button--cancel {
    padding: 6px 14px;
    transition: background-color 0.15s ease-out;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: $font-size-sm;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    appearance: none;
  }

  &__button--ok {
    background-color: var(--accent);
    color: #fff;

    &:hover {
      background-color: var(--accent-hover);
    }
  }

  &__button--cancel {
    border-color: var(--border);
    background-color: transparent;
    color: var(--text);

    &:hover {
      background-color: var(--code-bg);
    }
  }
}
</style>
