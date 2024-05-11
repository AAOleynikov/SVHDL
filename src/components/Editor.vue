<script setup>
/* Закомментирована подсветка синтаксиса textmate, потому что она не работала */

import { ref, onMounted, reactive } from "vue";
// import * as monaco from "monaco-editor";
// import editorTheme from "@/editor/light_plus_converted.json?raw";
// import vhdlTextMate from "@/editor/test_textmate.json?raw";
// import { loadWASM } from "onigasm"; // peer dependency of 'monaco-textmate'
// import { Registry } from "monaco-textmate"; // peer dependency
// import { wireTmGrammars } from "monaco-editor-textmate";

const storage = defineModel();

const editorRef = reactive([]);
const handleMount = (editor) => (editorRef.value = editor);

const handleUpdate = () => {
  storage.value.activeProject.isUnsaved = true;
  storage.value.activeProject.activeFile.isUnsaved = true;
};

// async function liftOff() {
//   await loadWASM("node_modules/onigasm/lib/onigasm.wasm");

//   const registry = new Registry({
//     getGrammarDefinition: async (scopeName) => {
//       return {
//         format: "json",
//         content: vhdlTextMate,
//       };
//     },
//   });

//   // map of monaco "language id's" to TextMate scopeNames
//   const grammars = new Map();
//   grammars.set("vhdl", "source.vhdl");

//   // monaco's built-in themes aren't powereful enough to handle TM tokens
//   // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter

//   //console.log(editorTheme)
//   const theme = JSON.parse(editorTheme);
//   console.log(theme);

//   monaco.languages.register({ id: "vhdl" });
//   monaco.editor.defineTheme("donantoniochehonte", theme);
//   monaco.editor.setTheme(theme);

//   await wireTmGrammars(monaco, registry, grammars, editorRef.value);
//   console.log("here");

//   const grammar = await registry.loadGrammar("source.vhdl");
//   console.log(grammar.tokenizeLine("123 // 456\n333"));
// }

// // Загрузка TextMate VHDL
// onMounted(async () => {
//   await liftOff();
// });
</script>

<template>
  <div class="flex-grow flex flex-col">
    <vue-monaco-editor
      style="height: 100%; width: 100%; flex-grow: 1"
      v-model:value="storage.activeProject.activeFile.code"
      @update:value="handleUpdate"
      @mount="handleMount"
    />
  </div>
</template>

<style scoped></style>
