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
import Loading from "vue-loading-overlay";
import SimulationControl from "./components/waveform/SimulationControl.vue";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  <div
    class="fixed z-50 w-full h-full"
    v-if="ide_state.isLoading"
    style="background-color: rgba(0, 0, 0, 0.5)">
    <div class="flex justify-center items-center h-full">
      <loading :active="true" :can-cancel="true" :is-full-page="true" />
    </div>
  </div>
  <div class="h-screen max-h-screen flex flex-col">
    <NavBar v-model="ide_state" :persTimer="persistencyTimerId" />
    <div class="pt-[70px] w-full box-border h-full max-h-full">
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
  </div>
  <Toaster richColors closeButton />
  <Dialog
    class="w-half min-w-half"
    :open="ide_state.consoleStore.isConsoleOpened"
    @update:open="
      () => {
        ide_state.consoleStore.closeConsole();
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
          {{ ide_state.consoleStore.consoleText }}
        </span>
      </div>
    </DialogContent>
  </Dialog>
</template>
