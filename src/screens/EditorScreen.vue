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

const projSys = new ProjectStorage();

const code=ref("asdfasdf")

const treeContent = ref(projSys);
</script>

<template>
  <ResizablePanelGroup
    id="group-1"
    direction="horizontal"
    class="border flex-grow flex-row"
  >
    <ResizablePanel id="panel-1" :default-size="10" :min-size="10">
      <div class="border-black pt-2 overflow-auto gap-1 flex flex-col">
        <Button>Сохранить</Button>
        <div><FileTree v-model:data="treeContent" /></div>
      </div>
    </ResizablePanel>
    <ResizableHandle id="handle-1" />
    <ResizablePanel id="panel-2" :min-size="10" class="flex flex-col">
      <Editor v-model="code" />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
