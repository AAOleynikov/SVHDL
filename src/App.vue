<script setup lang="ts">
/* Экран IDE с навигацией и состояниями редактора */
import { ref, reactive, watch } from "vue";
import EditorScreen from "@/screens/EditorScreen.vue";
import SignalsScreen from "@/screens/SignalsScreen.vue";
import NavBar from "@/components/NavBar.vue";
import { IDEState } from "./lib/ideState";
import { Toaster } from "@/components/ui/sonner";
import { validateTransition } from "./lib/validateTransition";
import WaveformScreen from "./screens/WaveformScreen.vue";
import SimulationControl from "./components/waveform/SimulationControl.vue";

const persistencyTimerId = ref(undefined);
const ide_state = reactive<IDEState>(IDEState.loadFromLocalStorage());
watch(ide_state, (newO, oldO) => {
  if (persistencyTimerId.value === undefined) {
    persistencyTimerId.value = setTimeout(() => {
      ide_state.saveToLocalStorage();
      persistencyTimerId.value = undefined;
    }, 1000);
  }
});
ide_state.activeScreen = validateTransition(
  ide_state,
  ide_state.activeScreen,
  ide_state.activeScreen
);
</script>

<template>
  <div class="h-screen max-h-screen flex flex-col">
    <NavBar v-model="ide_state" :persTimer="persistencyTimerId" />
    <template v-if="ide_state.activeScreen == 'vhdl'">
      <EditorScreen v-model="ide_state" />
    </template>
    <template v-if="ide_state.activeScreen == 'stymulus'">
      <SignalsScreen v-model="ide_state" />
    </template>
    <template v-if="ide_state.activeScreen == 'waveform'">
      <WaveformScreen v-model="ide_state" />
    </template>
  </div>
  <Toaster richColors closeButton />
</template>
