<script setup lang="ts">
import { IDEState } from "@/lib/ideState";
import { onMounted, watch, onUnmounted, useTemplateRef } from "vue";
import { editor } from "monaco-editor";

const props = defineProps({ modelValue: { type: IDEState, required: true } });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits(["update:modelValue"]);

const handleUpdate = () => {
  if (props.modelValue.activeFile === undefined) {
    throw new Error("activeFile===undefined");
  }
  if (model === undefined) {
    throw new Error("model===undefined");
  }
  props.modelValue.activeFile.setUnsaved();
  props.modelValue.activeFile.setCode(model.getLinesContent().join("\n"));
};

let myEditor: editor.IStandaloneCodeEditor | undefined = undefined;
let model: editor.ITextModel | undefined = undefined;
const editorRef = useTemplateRef("editor");

onMounted(() => {
  if (props.modelValue.activeFile === undefined) {
    throw new Error("props.modelValue.activeFile===undefined");
  }
  myEditor = editor.create(editorRef.value as HTMLDivElement, {
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
    if (myEditor === undefined) {
      throw new Error("myEditor===undefined");
    }
    if (newValue === undefined) {
      throw new Error("newValue===undefined");
    }
    model = editor.createModel(newValue.code, "vhdl");
    myEditor.setModel(model);
    model.onDidChangeContent(handleUpdate);
  }
);
onUnmounted(() => {});
</script>

<template>
  <div ref="editor" class="flex-grow flex flex-col"></div>
</template>

<style scoped></style>
