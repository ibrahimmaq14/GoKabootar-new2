<template lang="pug">
  modal(:has-header="true", @close="$emit('close')")
    div(slot="header")
      h4 Create Private Room
    div(slot="body")
      .alert.alert-success(v-if="roomCreated")
        icon.fa-fw(name="check-circle")
        strong  Room Created Successfully!
        p(style="margin: 10px 0 5px 0")
          strong Room ID:
          |
          code(style="background: #fff; padding: 2px 8px; border-radius: 3px; font-size: 14px; user-select: all") {{ createdRoomId }}
        p(style="margin: 5px 0")
          strong Password:
          |
          code(style="background: #fff; padding: 2px 8px; border-radius: 3px; font-size: 14px") {{ roomPassword }}
        p(style="margin-top: 10px; font-size: 13px; color: #666")
          icon.fa-fw(name="info-circle")
          |  Share this Room ID and password with your team members so they can join.
        .text-right(style="margin-top: 15px")
          button.btn.btn-primary(@click="$emit('close')", type="button")
            icon.fa-fw(name="check")
            |  Done

      .alert.alert-info(v-if="!roomCreated")
        icon.fa-fw(name="info-circle")
        |  Create a private room to share files with specific people. Share the room ID and password with your team.

      .alert.alert-danger(v-if="error && !roomCreated")
        icon.fa-fw(name="exclamation-triangle")
        |  {{ error }}

      form(@submit.prevent="createRoom", v-if="!roomCreated")
        .form-group
          label(for="roomName") Room Name
          input#roomName.form-control(
            type="text",
            v-model="roomName",
            placeholder="Enter room name",
            required,
            autofocus
          )

        .form-group
          label(for="roomPassword") Room Password
          input#roomPassword.form-control(
            type="password",
            v-model="roomPassword",
            placeholder="Create a password",
            required
          )

        .form-group
          label(for="confirmPassword") Confirm Password
          input#confirmPassword.form-control(
            type="password",
            v-model="confirmPassword",
            placeholder="Confirm password",
            required
          )

        .text-right
          button.btn.btn-default(type="button", @click="$emit('close')", style="margin-right: 10px") Cancel
          button.btn.btn-primary(type="submit", :disabled="creating")
            icon.fa-fw(name="spinner", spin, v-if="creating")
            icon.fa-fw(name="plus", v-else)
            |  Create Room
</template>

<script>
import Modal from '../common/Modal.vue';
import 'vue-awesome/icons/info-circle';
import 'vue-awesome/icons/spinner';
import 'vue-awesome/icons/plus';
import 'vue-awesome/icons/exclamation-triangle';
import 'vue-awesome/icons/check-circle';
import 'vue-awesome/icons/check';

export default {
  name: 'RoomCreation',
  components: { Modal },

  data() {
    return {
      roomName: '',
      roomPassword: '',
      confirmPassword: '',
      error: '',
      creating: false,
      roomCreated: false,
      createdRoomId: ''
    };
  },

  methods: {
    async createRoom() {
      this.error = '';

      if (!this.roomName.trim()) {
        this.error = 'Please enter a room name';
        return;
      }

      if (this.roomPassword.length < 4) {
        this.error = 'Password must be at least 4 characters';
        return;
      }

      if (this.roomPassword !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.creating = true;

      try {
        const room = await this.$store.dispatch('rooms/createRoom', {
          name: this.roomName,
          password: this.roomPassword
        });
        this.roomCreated = true;
        this.createdRoomId = room.id;
      } catch (e) {
        this.error = e.message;
      } finally {
        this.creating = false;
      }
    }
  }
};
</script>

<style scoped>
code {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}
</style>
