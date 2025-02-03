<script setup lang="ts">
/* Экран IDE с навигацией и состояниями редактора */
import { ref, reactive, watch } from "vue";
import EditorScreen from "@/pages/EditorScreen.vue";
import SignalsScreen from "@/pages/SignalsScreen.vue";
import NavBar from "@/widgets/navbar/NavBar.vue";
import { IDEState } from "../lib/ideState";
import { Toaster } from "@/shared/ui/sonner";
import { validateTransition } from "../lib/validateTransition";
import WaveformScreen from "@/pages/WaveformScreen.vue";
import Loading from "vue-loading-overlay";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useUIStore } from "./stores/ui";
import { Time } from "@/entities/time";

const persistencyTimerId = ref(undefined);
const ide_state = reactive<IDEState>(IDEState.loadFromLocalStorage());
watch(ide_state, () => {
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

const ui = useUIStore();
</script>

<template>
  <div
    v-if="ui.isLoading"
    class="fixed z-50 w-full h-full"
    style="background-color: rgba(0, 0, 0, 0.5)">
    <div class="flex justify-center items-center h-full">
      <loading :active="true" :can-cancel="true" :is-full-page="true" />
    </div>
  </div>
  <div class="h-screen max-h-screen flex flex-col">
    <NavBar v-model="ide_state" :pers-timer="persistencyTimerId" />
    <div class="pt-[70px] w-full box-border h-full max-h-full">
      <template v-if="ui.activeScreen == 'vhdl'">
        <EditorScreen v-model="ide_state" />
      </template>
      <template v-if="ui.activeScreen == 'stymulus' && ide_state.stymulusState">
        <SignalsScreen
          v-model="ide_state.stymulusState"
          :start-simulation="(firstStepSize: Time)=>{ide_state.startSimulation(firstStepSize)}" />
      </template>
      <template v-if="ui.activeScreen == 'waveform'">
        <WaveformScreen v-model="ide_state" />
      </template>
    </div>
  </div>
  <Toaster rich-colors close-button />
  <Dialog
    class="w-half min-w-half"
    :open="ui.console.isConsoleOpened"
    @update:open="
      () => {
        ui.closeConsole();
      }
    ">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Console</DialogTitle>
        <DialogDescription>
          All errors from GHDL will be displayed here
        </DialogDescription>
      </DialogHeader>
      <div class="bg-black min-w-full">
        <span class="monospaceFont text-lime-400">
          {{ ui.console.consoleText }}
        </span>
      </div>
    </DialogContent>
  </Dialog>
</template>
