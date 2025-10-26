// src/store/rooms.js
export default {
  namespaced: true,

  state: {
    currentRoom: null,
    rooms: {}, // Active rooms stored in localStorage
    userName: "Member" // Default user name
  },

  getters: {
    isInRoom: state => !!state.currentRoom,
    currentRoomName: state => (state.currentRoom ? state.currentRoom.name : ""),
    currentRoomId: state => (state.currentRoom ? state.currentRoom.id : ""),
    currentRoomPassword: state =>
      state.currentRoom ? state.currentRoom.password : ""
  },

  mutations: {
    SET_CURRENT_ROOM(state, room) {
      state.currentRoom = room;
      if (room) {
        // Save to localStorage
        localStorage.setItem("currentRoom", JSON.stringify(room));
      } else {
        localStorage.removeItem("currentRoom");
      }
    },

    ADD_ROOM(state, room) {
      state.rooms[room.id] = room;
      // Save to localStorage
      localStorage.setItem("rooms", JSON.stringify(state.rooms));
    },

    REMOVE_ROOM(state, roomId) {
      delete state.rooms[roomId];
      localStorage.setItem("rooms", JSON.stringify(state.rooms));
    },

    LOAD_FROM_STORAGE(state) {
      // Load current room
      const currentRoom = localStorage.getItem("currentRoom");
      if (currentRoom) {
        try {
          state.currentRoom = JSON.parse(currentRoom);
        } catch (e) {
          console.error("Failed to load current room from localStorage", e);
        }
      }

      // Load all rooms
      const rooms = localStorage.getItem("rooms");
      if (rooms) {
        try {
          state.rooms = JSON.parse(rooms);
        } catch (e) {
          console.error("Failed to load rooms from localStorage", e);
        }
      }
    }
  },

  actions: {
    initializeFromStorage({ commit }) {
      commit("LOAD_FROM_STORAGE");
    },

    async createRoom({ commit, rootState, dispatch }, { name, password }) {
      // Generate a room ID (this will be the sid)
      const roomId = Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase();

      const room = {
        id: roomId,
        name,
        password,
        created: Date.now(),
        messages: []
      };

      // Save room to localStorage
      commit("ADD_ROOM", room);
      commit("SET_CURRENT_ROOM", room);

      // Set the upload session to use this room ID as sid
      commit("upload/SET_SID", roomId, { root: true });

      // Set the bucket password
      if (password) {
        commit("upload/PASSWORD", password, { root: true });
      }

      return room;
    },

    async joinRoom({ commit, state }, { id, password }) {
      // Check if room exists in localStorage
      const room = state.rooms[id];

      if (room && room.password === password) {
        commit("SET_CURRENT_ROOM", room);

        // Set the upload session to use this room ID as sid
        commit("upload/SET_SID", id, { root: true });

        // Set the bucket password
        if (password) {
          commit("upload/PASSWORD", password, { root: true });
        }

        return room;
      }

      // If room doesn't exist locally, still allow joining with ID and password
      // This enables joining from different browsers/devices
      const newRoom = {
        id,
        name: `Room ${id}`,
        password,
        joined: Date.now(),
        messages: []
      };

      commit("ADD_ROOM", newRoom);
      commit("SET_CURRENT_ROOM", newRoom);

      // Set the upload session to use this room ID as sid
      commit("upload/SET_SID", id, { root: true });

      // Set the bucket password
      if (password) {
        commit("upload/PASSWORD", password, { root: true });
      }

      return newRoom;
    },

    leaveRoom({ commit, dispatch }) {
      commit("SET_CURRENT_ROOM", null);

      // Reset to a new upload session
      dispatch("upload/newSession", null, { root: true });
    },

    addMessage({ commit, state }, messageData) {
      if (!state.currentRoom) return;

      const message = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...messageData
      };

      state.currentRoom.messages.push(message);

      // Update in rooms object and localStorage
      const room = state.rooms[state.currentRoom.id];
      if (room) {
        room.messages = state.currentRoom.messages;
        commit("ADD_ROOM", room);
      }
    },

    updateMessageStats({ commit, state }, { messageId, downloadCount }) {
      if (!state.currentRoom) return;

      const message = state.currentRoom.messages.find(m => m.id === messageId);
      if (message) {
        message.downloadCount = downloadCount;

        // Update in rooms object and localStorage
        const room = state.rooms[state.currentRoom.id];
        if (room) {
          const roomMessage = room.messages.find(m => m.id === messageId);
          if (roomMessage) {
            roomMessage.downloadCount = downloadCount;
          }
          commit("ADD_ROOM", room);
        }
      }
    }
  }
};
