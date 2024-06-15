<script setup lang="ts">
import { IDEState } from "@/lib/ideState";
import { ProjectFile } from "@/lib/projectSystem";
import { ref, onMounted, reactive } from "vue";

const ide_state = defineModel<IDEState>({ required: true });

const handleUpdate = () => {
  ide_state.value.activeFile.setUnsaved();
  console.log("handled");
};
</script>

<template>
  <div class="flex-grow flex flex-col">
    <vue-monaco-editor
      style="height: 100%; width: 100%; flex-grow: 1"
      v-model:value="ide_state.activeFile.code"
      @update:value="handleUpdate" />
  </div>
</template>

<style scoped></style>
