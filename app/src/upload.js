import Vue from "vue";
import Vuex from "vuex";
import Upload from "./Upload.vue";
import Icon from "vue-awesome/components/Icon";
import store from "./Upload/store";
import dragDrop from "drag-drop";

Vue.component("icon", Icon);

const app = new Vue({
  el: "#upload",
  store,
  data: {
    baseURI: document.head.getElementsByTagName("base")[0].href,
    lang: {},
    configFetched: false
  },
  render: h => h(Upload),
  async mounted() {
    // Fetch translations
    try {
      const langRes = await fetch(this.baseURI + "lang.json");
      this.lang = await langRes.json();
      this.$store.commit("LANG", this.lang);
    } catch (e) {
      console.error("Failed to load translations", e);
    }

    // Fetch config
    try {
      await this.$store.dispatch("config/fetch");
      this.configFetched = true;
    } catch (e) {
      if (e.code === "PWDREQ") {
        this.$store.commit("config/UPLOAD_PASS_REQUIRED", true);
        this.configFetched = true;
      } else {
        console.error(e);
        this.$store.commit("ERROR", e.message || e.toString());
      }
    }

    // Setup drag & drop
    dragDrop("body", files => {
      if (this.$store.state.disabled) return;
      this.$store.dispatch("upload/addFiles", files);
    });
  }
});

window.GoKabootar_VERSION = GoKabootar_VERSION;
