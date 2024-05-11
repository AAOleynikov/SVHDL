<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import FileTree from "@/components/FileTree.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Button from "@/components/ui/button/Button.vue";
import Editor from "@/components/Editor.vue";
import { ProjectStorage } from "@/lib/projectSystem";

const projSys = reactive(new ProjectStorage());
</script>

<template>
  <ResizablePanelGroup
    id="group-1"
    direction="horizontal"
    class="border flex-grow flex-row"
  >
    <ResizablePanel id="panel-1" :default-size="40" :min-size="10">
      <div class="border-black pt-2 overflow-auto gap-1 flex flex-col">
        <Button @click="projSys.saveAll()">Сохранить</Button>
        <div><FileTree v-model:data="projSys" /></div>
      </div>
    </ResizablePanel>
    <ResizableHandle id="handle-1" />
    <ResizablePanel id="panel-2" :min-size="10" class="flex flex-col">
      <template
        v-if="projSys.activeProject && projSys.activeProject.activeFile"
      >
        <Editor v-model="projSys" />
      </template>
      <template
        v-if="!(projSys.activeProject && projSys.activeProject.activeFile)"
      >
        <div
          class="flex flex-col items-center justify-center grow-1 h-full gap-3"
        >
          <svg
            version="1.1"
            width="200"
            height="250"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="200" r="50" fill="gray" />
            <circle cx="150" cy="200" r="50" fill="gray" />
            <circle cx="100" cy="50" r="50" fill="gray" />
            <rect x="50" y="50" width="100" height="150" fill="gray" />
          </svg>
          <h3>Откройте файл, чтобы запустить редактор</h3>
        </div>
      </template>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
