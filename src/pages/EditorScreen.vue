<script setup lang="ts">
import FileTree from "@/components/FileTree.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  // @ts-expect-error: shadcn-модуль
} from "@/components/ui/resizable";
// @ts-expect-error: shadcn-модуль
import Button from "@/shared/components/ui/button/Button.vue";
import Editor from "@/widgets/monaco/MonacoEditor.vue";
import { IDEState } from "@/lib/ideState";

import { useUIStore } from "@/stores/ui";

const ui = useUIStore();

const ide_state = defineModel<IDEState>({ required: true });
</script>

<template>
  <ResizablePanelGroup
    id="group-1"
    direction="horizontal"
    class="border flex-grow flex-row">
    <ResizablePanel id="panel-1" :default-size="40" :min-size="10">
      <div class="border-black pt-2 overflow-auto gap-1 flex flex-col">
        <Button @click="ide_state.saveAll()">Save all</Button>
        <Button @click="ide_state.discardAll()">Discard changes</Button>
        <Button @click="ide_state.compile()">Compile</Button>
        <Button
          :disabled="!ui.console.isConsoleAvailable"
          @click="
            () => {
              ui.openConsole();
            }
          "
          >Console</Button
        >
        <div><FileTree v-model="ide_state" /></div>
      </div>
    </ResizablePanel>
    <ResizableHandle id="handle-1" />
    <ResizablePanel id="panel-2" :min-size="10" class="flex flex-col">
      <template v-if="ide_state.activeFile">
        <Editor v-model="ide_state" />
      </template>
      <template v-if="!ide_state.activeFile">
        <div
          class="flex flex-col items-center justify-center grow-1 h-full gap-3">
          <svg
            version="1.1"
            width="200"
            height="250"
            xmlns="http://www.w3.org/2000/svg">
            <!-- <circle cx="50" cy="200" r="50" fill="gray" />
            <circle cx="150" cy="200" r="50" fill="gray" /> -->
            <circle cx="100" cy="50" r="50" fill="gray" />
            <rect x="50" y="50" width="100" height="150" fill="gray" />
          </svg>
          <h3>Откройте файл, чтобы запустить редактор</h3>
        </div>
      </template>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
