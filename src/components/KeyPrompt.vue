<template>
  <v-dialog v-model="enable" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="key"
          :rules="[rules.required]"
          type="password"
          label="Enter a password to encrypt the file."
          maxlength="50"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click="done">OK</v-btn>
        <v-btn flat @click="cancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'KeyPrompt',
  data: function() {
    return {
      title: '',
      rules: {
        required: value => !!value || 'Required.',
      },
    };
  },
  computed: {
    enable: {
      get: function() {
        return this.$store.state.Editor.crypt.enable;
      },
      set: function(v) {
        this.$store.dispatch('setCryptEnable', v);
      },
    },
    key: {
      get: function() {
        return this.$store.state.Editor.crypt.key;
      },
      set: function(v) {
        this.$store.dispatch('setCryptKey', v);
      },
    },
  },
  watch: {
    enable: function(value) {
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
