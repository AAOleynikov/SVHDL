<script setup lang="ts">
import { IDEState } from "@/lib/ideState";
import { onMounted, watch, onUnmounted } from "vue";
import { editor } from "monaco-editor";

const props = defineProps({ modelValue: { type: IDEState, required: true } });
const emit = defineEmits(["update:modelValue"]);

const handleUpdate = () => {
  props.modelValue.activeFile.setUnsaved();
  props.modelValue.activeFile.code = model.getLinesContent().join("\n");
};

let myEditor: editor.IStandaloneCodeEditor | undefined = undefined;
let model: editor.ITextModel | undefined = undefined;

onMounted(() => {
  //TODO перевести на ref
  myEditor = editor.create(document.getElementById("monacoEditor228"), {
    language: "vhdl",
    automaticLayout: true,
  });
  model = editor.createModel(props.modelValue.activeFile.code, "vhdl");
  myEditor.setModel(model);
  model.onDidChangeContent(handleUpdate);
});

watch(
  () => props.modelValue.activeFile,
  (newValue) => {
    model = editor.createModel(newValue.code, "vhdl");
    myEditor.setModel(model);
    model.onDidChangeContent(handleUpdate);
  }
);
onUnmounted(() => {});
</script>

<template>
  <div class="flex-grow flex flex-col" id="monacoEditor228"></div>
</template>

<style scoped></style>
