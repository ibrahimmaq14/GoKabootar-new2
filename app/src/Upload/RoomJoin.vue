<template lang="pug">
  modal(:has-header="true", @close="$emit('close')")
    div(slot="header")
      h4 Join Private Room
    div(slot="body")
      .alert.alert-info
        icon.fa-fw(name="info-circle")
        |  Enter the room ID and password shared with you to join a private room.

      .alert.alert-danger(v-if="error")
        icon.fa-fw(name="exclamation-triangle")
        |  {{ error }}

      form(@submit.prevent="joinRoom")
        .form-group
          label(for="roomId") Room ID
          input#roomId.form-control(
            type="text",
            v-model="roomId",
            placeholder="Enter room ID",
            required,
            autofocus
          )

        .form-group
          label(for="password") Room Password
          input#password.form-control(
            type="password",
            v-model="password",
            placeholder="Enter room password",
            required
          )

        .text-right
          button.btn.btn-default(type="button", @click="$emit('close')", style="margin-right: 10px") Cancel
          button.btn.btn-primary(type="submit", :disabled="joining")
            icon.fa-fw(name="spinner", spin, v-if="joining")
            icon.fa-fw(name="sign-in-alt", v-else)
            |  Join Room
</template>

<script>
import Modal from '../common/Modal.vue';
import 'vue-awesome/icons/info-circle';
import 'vue-awesome/icons/spinner';
import 'vue-awesome/icons/sign-in-alt';
import 'vue-awesome/icons/exclamation-triangle';

export default {
  name: 'RoomJoin',
  components: { Modal },

  data() {
    return {
      roomId: '',
      password: '',
      error: '',
      joining: false
    };
  },

  methods: {
    async joinRoom() {
      this.error = '';

      if (!this.roomId.trim()) {
        this.error = 'Please enter a room ID';
        return;
      }

      if (!this.password) {
        this.error = 'Please enter the room password';
        return;
      }

      this.joining = true;

      try {
        await this.$store.dispatch('rooms/joinRoom', {
          id: this.roomId,
          password: this.password
        });
        this.$emit('close');
      } catch (e) {
        this.error = e.message;
      } finally {
        this.joining = false;
      }
    }
  }
};
</script>
