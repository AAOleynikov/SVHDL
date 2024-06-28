import { createApp } from "vue";
import App from "./App.vue";
import "@/assets/css/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { loader } from "@guolao/vue-monaco-editor";
import * as monaco from "monaco-editor";
import { vhdl_lang } from "./assets/vhdl_monarch";
import { createPinia } from "pinia";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

const pinia=createPinia()
const app = createApp(App);
app.use(pinia)

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
loader.config({ monaco });

monaco.languages.register({ id: "vhdl" });
monaco.languages.setMonarchTokensProvider("vhdl", vhdl_lang);

app.mount("#app");
