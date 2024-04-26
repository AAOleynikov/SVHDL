<script setup>
import "vcdrom/app/vcdrom.js";
import { reactive, ref, watch } from "vue";
import Editor from "./components/Editor.vue";
import FileTree from "./components/FileTree.vue";
import NavBar from "./components/NavBar.vue";
import Button from "./components/ui/button/Button.vue";
import VC from "./components/VC.vue";
import VCDViewer from "@/components/VCDViewer.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import sampleCode from "@/sample.vhd?raw";
import { processCode } from "@/parse/parser";
import { vhdlFile } from "./lib/vhdlFile";
import mock_raw from "@/fancytree_test.json?raw";
const mock = reactive(JSON.parse(mock_raw));
//Одно из следующих: vhdl, sigs, vcd
const state = ref("vhdl");

const code = ref(sampleCode);

// В установку сигналов
const fileParse = reactive(new vhdlFile());

watch(state, (newState, oldState) => {
  if (oldState == "vhdl" && newState == "sigs") {
    console.log("Watcher launched!");
    const newData = processCode(code.value);
    fileParse.value = newData;
    console.log(newData);
  }
});

function clickB() {
  mock.push({ title: "More...", folder: true });
}
</script>

<template>
  <div class="h-screen max-h-screen flex flex-col">
    <NavBar v-model:editor-state="state" />
    <template v-if="state == 'vhdl'">
      <ResizablePanelGroup
        id="demo-group-1"
        direction="horizontal"
        class="border flex-grow"
      >
        <ResizablePanel id="demo-panel-1" :default-size="40" :min-size="10">
          <div class="border-black pt-2 overflow-auto gap-1 flex flex-col">
            <Button>Запустить</Button>
            <Button @click="clickB">Добавить хуйню в дерево</Button>
            <div><FileTree v-model:data="mock" /></div>
          </div>
        </ResizablePanel>
        <ResizableHandle id="demo-handle-1" />
        <ResizablePanel id="demo-panel-2" :min-size="40" class="flex flex-col">
          <Editor v-model="code" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </template>
    <template v-if="state == 'sigs'">
      <VC v-model="fileParse" />
    </template>
    <template v-if="state == 'vcd'">
      <div>ЗДЕСЬ БУДЕТ МЯСО</div>
      <VCDViewer />
    </template>
  </div>
</template>

<style scoped></style>
