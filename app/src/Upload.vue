<template lang="pug">
  .upload-app#uploadApp
    //- Room Navigation Toggle
    .room-toggle(v-if="!showLogin")
      .btn-group.btn-group-sm
        button.btn.btn-default(:class="{active: viewMode === 'upload'}", @click="viewMode = 'upload'")
          icon(name="cloud-upload-alt")
          |  Upload Files
        button.btn.btn-info(:class="{active: viewMode === 'room'}", @click="viewMode = 'room'")
          icon(name="comments")
          |  Team Room

    //- UPLOAD VIEW (Original functionality - unchanged)
    div(v-if="viewMode === 'upload'")
      a.btn.btn-sm.btn-info.btn-new-session(
        v-if='!showLogin',
        @click='newSession()',
        @keydown.enter.prevent='newSession()',
        @keydown.space.prevent='newSession()',
        :title='$root.lang.newUpload',
        tabindex="-1",
        role="button"
      )
        icon.fa-fw(name="cloud-upload-alt")
        span.hidden-xs  {{ $root.lang.newUpload }}
      .alert.alert-danger(v-show="error")
        strong
          icon.fa-fw(name="exclamation-triangle")
          |  {{ error }}
      form.well.upload-uploadPassword(v-if='showLogin', @submit.prevent='setUploadPass()')
        h3 {{ $root.lang.uploadPassword }}
        .form-group
          input.form-control(type='password', v-model='uploadPassword', autofocus)
        p.text-danger(v-show='uploadPasswordWrong')
          strong {{ $root.lang.accessDenied }}
        |
        button.uploadPass.btn.btn-primary(:disabled='uploadPassword.length<1', type="submit")
          icon.fa-fw(name="key")
          |  {{ $root.lang.login }}
      div(v-else-if="$root.configFetched")
        .well(v-show="state === 'uploaded'")
          .pull-right.btn-group.upload-success-btns
            a.btn.btn-primary(
              v-if="!disableQrCode",
              @click.prevent="showQrCode",
              @keydown.enter.prevent="showQrCode",
              @keydown.space.prevent="showQrCode",
              href="#",
              :title="$root.lang.showQrCode",
              tabindex="0",
              role="button"
            )
              icon.fa-fw(name="qrcode")
              | QR-Code
            a.btn.btn-primary(
              :href="mailLnk",
              :title="$root.lang.sendViaMail",
              tabindex="0"
            )
              icon.fa-fw(name="envelope")
              |  {{ $root.lang.email }}
            clipboard.btn.btn-primary(
              :value='shareUrl',
              :title="$root.lang.copyToClipboard",
              tabindex="0"
            )
          h3.text-success
            icon.fa-fw(name="check")
            |  {{ $root.lang.uploadCompleted }}
          div.share-link
            span.title {{ $root.lang.downloadLink }}:
            |
            a(:href='shareUrl') {{ shareUrl }}
        .row.overall-process(v-show="state === 'uploading'")
          .col-xs-12
            icon.pull-left(name="spinner", scale="2", spin="", style="margin-right: 10px")
            .progress
              .progress-bar.progress-bar-success.progress-bar-striped.active(:style="{width: percentUploaded+'%'}")
                span(v-show='percentUploaded>8') {{ percentUploaded }}%
                span(v-show='percentUploaded>15' style="margin-left: 10px") ({{ humanFileSize(bytesUploaded) }} / {{ humanFileSize(bucketSize) }})
        .row
          .col-sm-7
            files
          .col-sm-5
            settings
            .text-right(v-show='showUploadBtn')
              button#uploadBtn.btn.btn-lg.btn-success(@click="$store.dispatch('upload/upload')")
                icon.fa-fw(name="upload")
                |  {{ $root.lang.upload }}
            .text-right(v-show="state === 'uploadError'")
              button#uploadRetryBtn.btn.btn-lg.btn-success(@click="$store.dispatch('upload/upload')")
                icon.fa-fw(name="upload")
                |  {{ $root.lang.retry }}

    //- ROOM VIEW (Separate chat-based room interface)
    div(v-if="viewMode === 'room'")
      //- Not in a room - show join/create options
      .room-lobby(v-if="!$store.getters['rooms/isInRoom']")
        .well.text-center
          h3
            icon(name="comments")
            |  Team Room
          p Share file links with your team in a private room
          .row
            .col-sm-6
              .panel.panel-primary
                .panel-heading
                  strong Create New Room
                .panel-body
                  button.btn.btn-primary.btn-block(@click="showRoomCreation = true")
                    icon(name="plus")
                    |  Create Room
            .col-sm-6
              .panel.panel-info
                .panel-heading
                  strong Join Existing Room
                .panel-body
                  button.btn.btn-info.btn-block(@click="showRoomJoin = true")
                    icon(name="sign-in-alt")
                    |  Join Room

      //- In a room - show chat interface
      .room-chat(v-if="$store.getters['rooms/isInRoom']")
        .panel.panel-info
          .panel-heading
            .pull-right
              button.btn.btn-xs.btn-warning(@click="leaveRoom")
                icon(name="sign-out-alt")
                |  Leave Room
            h4(style="margin: 5px 0")
              icon(name="users")
              |  {{ $store.state.rooms.currentRoom.name }}
          .panel-body
            .room-info
              .row
                .col-sm-6
                  p(style="margin: 5px 0")
                    strong Room ID:
                    |
                    code.room-code {{ $store.state.rooms.currentRoom.id }}
                    button.btn.btn-xs.btn-default(@click="copyRoomId", style="margin-left: 5px")
                      icon(name="copy")
                .col-sm-6
                  p(style="margin: 5px 0")
                    strong Password:
                    |
                    code.room-code {{ $store.state.rooms.currentRoom.password }}

        //- Chat Messages Area
        .room-messages-container
          .panel.panel-default
            .panel-heading
              strong
                icon(name="comments")
                |  Shared Files
            .panel-body.room-messages(ref="messageArea", style="height: 400px; overflow-y: auto; background: #f9f9f9")
              .alert.alert-info.text-center(v-if="roomMessages.length === 0")
                icon(name="info-circle")
                |  No files shared yet. Upload a file below to share with your team.
              .message-item(v-for="msg in roomMessages", :key="msg.id", :class="{own: msg.isOwn}")
                .message-header
                  strong {{ msg.userName }}
                  small.text-muted  {{ formatDate(msg.timestamp) }}
                .message-content
                  .file-share-box
                    icon.file-icon(name="file", scale="1.5")
                    .file-info
                      p.file-name
                        strong {{ msg.fileName }}
                        span.text-muted(v-if="msg.fileSize")  ({{ msg.fileSize }})
                      p.file-message(v-if="msg.message") {{ msg.message }}
                      p.download-limit(v-if="msg.downloadLimit")
                        small.text-muted
                          icon(name="download")
                          |  Downloads: {{ msg.downloadCount || 0 }} / {{ msg.downloadLimit }}
                          span.text-danger(v-if="msg.downloadCount >= msg.downloadLimit")  (Link Expired)
                    .file-actions
                      a.btn.btn-sm.btn-success(
                        :href="msg.fileLink",
                        target="_blank",
                        :disabled="msg.downloadCount >= msg.downloadLimit",
                        :class="{'disabled': msg.downloadCount >= msg.downloadLimit}"
                      )
                        icon(name="download")
                        |  {{ msg.downloadCount >= msg.downloadLimit ? 'Expired' : 'Download' }}
                      clipboard.btn.btn-sm.btn-default(:value="msg.fileLink", title="Copy link", v-if="msg.downloadCount < msg.downloadLimit")
                        icon(name="copy")

        //- Upload Section for Room
        .room-upload-section
          .panel.panel-success
            .panel-heading
              strong
                icon(name="upload")
                |  Share a File with Team
            .panel-body
              .alert.alert-info(style="margin-bottom: 15px")
                icon(name="info-circle")
                |  Upload a file below. Once uploaded, the link will be automatically shared in the room.

              //- Mini upload interface
              .row
                .col-sm-8
                  .form-group
                    label Select File to Share
                    input.form-control(type="file", @change="handleRoomFileSelect", ref="roomFileInput", multiple)
                  .form-group(v-if="roomUploadFiles.length > 0")
                    label Add a message (optional)
                    input.form-control(v-model="roomUploadMessage", placeholder="Enter a message about this file...", maxlength="200")
                  .form-group(v-if="roomUploadFiles.length > 0")
                    label Download Limit
                    .input-group
                      input.form-control(
                        type="number",
                        v-model.number="roomDownloadLimit",
                        min="1",
                        max="100",
                        placeholder="Max downloads"
                      )
                      span.input-group-addon
                        icon(name="download")
                    small.text-muted Link will be destroyed after this many downloads
                .col-sm-4
                  label &nbsp;
                  button.btn.btn-success.btn-block(
                    @click="uploadToRoom",
                    :disabled="roomUploadFiles.length === 0 || roomUploading",
                    style="margin-top: 25px"
                  )
                    icon(name="spinner", spin, v-if="roomUploading")
                    icon(name="upload", v-else)
                    |  {{ roomUploading ? 'Uploading...' : 'Upload & Share' }}

              .selected-files(v-if="roomUploadFiles.length > 0")
                p
                  strong Selected Files:
                ul
                  li(v-for="(file, idx) in roomUploadFiles", :key="idx") {{ file.name }} ({{ humanFileSize(file.size) }})

    //- Room Modals
    RoomCreation(v-if="showRoomCreation", @close="showRoomCreation = false", @created="onRoomCreated")
    RoomJoin(v-if="showRoomJoin", @close="showRoomJoin = false")
</template>

<script type="text/babel">
  import { Encoder, Byte } from "@nuintun/qrcode";
  import { mapState, mapGetters } from 'vuex';
  import * as tus from "tus-js-client";

  import Clipboard from './common/Clipboard.vue';
  import Settings from './Upload/Settings.vue';
  import Files from './Upload/Files.vue';
  import RoomCreation from './Upload/RoomCreation.vue';
  import RoomJoin from './Upload/RoomJoin.vue';

  import 'vue-awesome/icons/cloud-upload-alt';
  import 'vue-awesome/icons/upload';
  import 'vue-awesome/icons/check';
  import 'vue-awesome/icons/spinner';
  import 'vue-awesome/icons/envelope';
  import 'vue-awesome/icons/qrcode';
  import 'vue-awesome/icons/exclamation-triangle';
  import 'vue-awesome/icons/key';
  import 'vue-awesome/icons/users';
  import 'vue-awesome/icons/plus';
  import 'vue-awesome/icons/sign-in-alt';
  import 'vue-awesome/icons/sign-out-alt';
  import 'vue-awesome/icons/copy';
  import 'vue-awesome/icons/link';
  import 'vue-awesome/icons/share-alt';
  import 'vue-awesome/icons/comments';
  import 'vue-awesome/icons/file';
  import 'vue-awesome/icons/download';
  import 'vue-awesome/icons/info-circle';

  import { humanFileSize } from "./Upload/store/upload";

  export default {
    name: 'Upload',
    components: {
      Settings,
      Files,
      Clipboard,
      RoomCreation,
      RoomJoin
    },

    data() {
      return {
        uploadPassword: '',
        uploadPasswordWrong: null,
        showRoomCreation: false,
        showRoomJoin: false,
        viewMode: 'upload', // 'upload' or 'room'
        roomUploadFiles: [],
        roomUploadMessage: '',
        roomUploading: false,
        roomDownloadLimit: 10, // Default download limit
        downloadStatsInterval: null
      }
    },

    computed: {
      ...mapState(['state']),
      ...mapState('config', ['uploadPassRequired', 'uploadPass', 'requireBucketPassword', 'disableQrCode']),
      ...mapState('upload', ['sid', 'files', 'password']),
      ...mapGetters(['error', 'disabled']),
      ...mapGetters('upload', ['percentUploaded', 'shareUrl', 'bucketSize', 'bytesUploaded']),
      mailLnk: function() {
        return this.$store.state.config
          && this.$store.state.config.mailTemplate
          && this.$store.state.config.mailTemplate.replace('%%URL%%', this.shareUrl);
      },
      showLogin() {
        return this.uploadPassRequired && this.uploadPasswordWrong !== false;
      },
      showUploadBtn() {
        return this.files.length
          && !this.disabled
          && (this.requireBucketPassword && this.password || !this.requireBucketPassword)
      },
      roomMessages() {
        return this.$store.state.rooms.currentRoom
          ? this.$store.state.rooms.currentRoom.messages || []
          : [];
      }
    },

    watch: {
      state: function(val) {
        if (val === 'uploaded' || val === 'uploadError') {
          const el = document.getElementById('uploadApp');
          if (!el || !el.scrollIntoView) return;
          el.scrollIntoView(true);
        }
      },
      roomMessages: {
        handler() {
          this.$nextTick(() => {
            this.scrollMessagesToBottom();
          });
        },
        deep: true
      }
    },

    async mounted() {
      // Initialize rooms from localStorage
      await this.$store.dispatch('rooms/initializeFromStorage');

      // Start refreshing download counts when in room
      this.startDownloadStatsRefresh();
    },

    beforeDestroy() {
      // Clean up interval
      if (this.downloadStatsInterval) {
        clearInterval(this.downloadStatsInterval);
      }
    },

    methods: {
      newSession() {
        if (!confirm(this.$root.lang.createNewUploadSession)) return;
        document.location.reload();
      },
      async setUploadPass() {
        try {
          this.$store.commit('config/SET', {uploadPass: this.uploadPassword});
          await this.$store.dispatch('config/fetch');
          this.uploadPasswordWrong = false;
        } catch(e) {
          if(e.code === 'PWDREQ') {
            this.uploadPassword = '';
            this.uploadPasswordWrong = true;
          } else {
            console.error(e);
          }
        }
      },
      showQrCode() {
        const qrcode = new Encoder({level: 'H'}).encode(new Byte(this.shareUrl));
        const imgSrc = qrcode.toDataURL(7, 10);
        const data = imgSrc.substr(imgSrc.indexOf(',') + 1);
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: 'image/gif;base64' });
        window.open(URL.createObjectURL(file));
      },
      humanFileSize,
      leaveRoom() {
        if (confirm('Are you sure you want to leave this room?')) {
          this.$store.dispatch('rooms/leaveRoom');
        }
      },
      copyRoomId() {
        const roomId = this.$store.state.rooms.currentRoom.id;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(roomId).then(() => {
            alert('Room ID copied to clipboard!');
          }).catch(() => {
            this.fallbackCopyRoomId(roomId);
          });
        } else {
          this.fallbackCopyRoomId(roomId);
        }
      },
      fallbackCopyRoomId(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Room ID copied to clipboard!');
        } catch (err) {
          alert('Failed to copy. Room ID: ' + text);
        }
        document.body.removeChild(textArea);
      },
      handleRoomFileSelect(event) {
        this.roomUploadFiles = Array.from(event.target.files);
      },
      async uploadToRoom() {
        if (this.roomUploadFiles.length === 0) return;

        this.roomUploading = true;

        try {
          // Create a new upload session for these files
          const uploadResult = await this.uploadFilesAndGetLink(this.roomUploadFiles);

          // Add message to room with the file link
          await this.$store.dispatch('rooms/addMessage', {
            fileName: this.roomUploadFiles.map(f => f.name).join(', '),
            fileSize: humanFileSize(this.roomUploadFiles.reduce((sum, f) => sum + f.size, 0)),
            fileLink: uploadResult.shareUrl,
            message: this.roomUploadMessage,
            userName: 'You',
            isOwn: true,
            downloadLimit: this.roomDownloadLimit,
            downloadCount: 0
          });

          // Clear form
          this.roomUploadFiles = [];
          this.roomUploadMessage = '';
          this.roomDownloadLimit = 10; // Reset to default
          this.$refs.roomFileInput.value = '';

          alert('File uploaded and shared with team!');
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Failed to upload file: ' + error.message);
        } finally {
          this.roomUploading = false;
        }
      },
      async uploadFilesAndGetLink(files) {
        // This creates a separate upload session and returns the share link
        return new Promise((resolve, reject) => {
          // Generate a new sid for this upload
          const sid = Math.random().toString(36).substr(2, 9);
          const baseUrl = document.head.getElementsByTagName('base')[0].href;
          const shareUrl = baseUrl + sid;

          // Use the TUS upload mechanism
          const uploadURI = (window.GoKabootar_UPLOAD_PATH || '/') + 'files';
          let uploadedCount = 0;
          const totalFiles = files.length;

          files.forEach(file => {
            const upload = new tus.Upload(file, {
              endpoint: uploadURI,
              metadata: {
                sid: sid,
                retention: this.$store.state.config.defaultRetention || '2592000',
                password: '',
                name: file.name,
                comment: '',
                type: file.type,
                downloadLimit: this.roomDownloadLimit.toString(),
                downloadCount: '0'
              },
              headers: {
                "x-passwd": this.$store.state.config.uploadPass || ''
              },
              chunkSize: 5000000,
              onSuccess: () => {
                uploadedCount++;
                if (uploadedCount === totalFiles) {
                  // Lock the bucket
                  fetch(uploadURI + '/' + sid + '?lock=yes', { method: 'PATCH' });
                  resolve({ shareUrl, sid });
                }
              },
              onError: (error) => {
                reject(error);
              }
            });
            upload.start();
          });
        });
      },
      formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';

        return date.toLocaleString();
      },
      scrollMessagesToBottom() {
        const el = this.$refs.messageArea;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      },
      onRoomCreated() {
        this.viewMode = 'room';
      },
      async refreshDownloadStats() {
        // Only refresh if in a room and have messages
        if (!this.$store.getters['rooms/isInRoom'] || this.roomMessages.length === 0) {
          return;
        }

        const baseUrl = document.head.getElementsByTagName('base')[0].href;

        for (const msg of this.roomMessages) {
          if (!msg.fileLink || !msg.downloadLimit) continue;

          try {
            // Extract fid from the file link
            const urlParts = msg.fileLink.split('/files/');
            if (urlParts.length < 2) continue;

            const fid = urlParts[1];

            // Fetch current download stats from server
            const response = await fetch(`${baseUrl}file-stats/${fid}`);
            if (response.ok) {
              const stats = await response.json();

              // Update the message with current stats
              msg.downloadCount = stats.downloadCount;

              // Update in store to persist
              await this.$store.dispatch('rooms/updateMessageStats', {
                messageId: msg.id,
                downloadCount: stats.downloadCount
              });
            }
          } catch (e) {
            console.error('Failed to fetch download stats:', e);
          }
        }
      },
      startDownloadStatsRefresh() {
        // Refresh every 5 seconds when viewing room
        this.downloadStatsInterval = setInterval(() => {
          if (this.viewMode === 'room' && this.$store.getters['rooms/isInRoom']) {
            this.refreshDownloadStats();
          }
        }, 5000);
      }
    }
  }
</script>

<style>
  @media all and (max-width: 500px) {
    .well {
      padding: 19px 8px;
    }
    .upload-success-btns {
      width: 100%;
      margin-bottom: 10px;
    }

    .upload-success-btns .btn {
      padding: 7px 5px;
      font-size: 12px;
    }
  }

  .room-toggle {
    margin-bottom: 20px;
  }

  .room-code {
    background: #fff;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 14px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    user-select: all;
    border: 1px solid #ddd;
  }

  .room-messages {
    padding: 15px;
  }

  .message-item {
    margin-bottom: 15px;
    padding: 10px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ddd;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .message-item.own {
    background: #e3f2fd;
    border-color: #90caf9;
  }

  .message-header {
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
  }

  .file-share-box {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .file-icon {
    color: #5bc0de;
  }

  .file-info {
    flex: 1;
  }

  .file-name {
    margin: 0 0 5px 0;
    font-size: 14px;
  }

  .file-message {
    margin: 0;
    color: #666;
    font-size: 13px;
    font-style: italic;
  }

  .file-actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .file-actions .btn {
    white-space: nowrap;
  }

  .room-upload-section {
    margin-top: 20px;
  }

  .selected-files {
    margin-top: 10px;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 4px;
  }

  .selected-files ul {
    margin: 5px 0 0 0;
    padding-left: 20px;
  }

  .download-limit {
    margin: 5px 0 0 0;
  }

  .download-limit .text-danger {
    font-weight: bold;
    margin-left: 5px;
  }

  .btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .share-link {
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    word-break: break-all;
  }

  .share-link .title {
    font-weight: bold;
    color: #333;
  }

  .share-link a {
    color: #337ab7;
    text-decoration: none;
  }

  .share-link a:hover {
    text-decoration: underline;
  }
</style>
