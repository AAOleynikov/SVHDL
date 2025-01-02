<script setup lang="ts">
import { IDEState } from "@/lib/ideState";
import { ProjectFile } from "@/lib/projectSystem";
import { ref, onMounted, reactive, watch, onUnmounted } from "vue";
import { editor, worker } from "monaco-editor";

const props = defineProps({ modelValue: { type: IDEState, required: true } });
const emit = defineEmits(["update:modelValue"]);

const handleUpdate = () => {
  props.modelValue.activeFile.setUnsaved();
  props.modelValue.activeFile.code = model.getLinesContent().join("\n");
};

var myEditor: editor.IStandaloneCodeEditor | undefined = undefined;
var model: editor.ITextModel | undefined = undefined;

onMounted(() => {
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
  (newValue, oldValue) => {
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
