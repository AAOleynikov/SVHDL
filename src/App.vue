<script setup>
/* Экран IDE с навигацией и состояниями редактора */
import { ref, reactive } from "vue";
import EditorScreen from "./EditorScreen.vue";
import SignalsScreen from "./SignalsScreen.vue";
import NavBar from "@/components/NavBar.vue";
import { IDEState } from "./lib/ideState";

const ide_state = reactive(IDEState.loadFromLocalStorage());
</script>

<template>
  <div class="h-screen max-h-screen flex flex-col">
    <NavBar v-model:editor-state="state" />
    <template v-if="ide_state.activeScreen == 'vhdl'">
      <EditorScreen />
    </template>
    <template v-if="ide_state.activeScreen == 'stymulus'">
      <SignalsScreen v-model="fileParse" />
    </template>
    <template v-if="ide_state.activeScreen == 'waveform'">
      <SignalsScreen v-model="fileParse" />
    </template>
  </div>
</template>
