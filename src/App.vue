<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import "vcdrom/app/vcdrom.js";
import NavBar from "./components/NavBar.vue";
import Button from "./components/ui/button/Button.vue";
import VCDViewer from "@/components/VCDViewer.vue";
import { RouterView } from "vue-router";

import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import sampleCode from "@/sample.vhd?raw";
import { processCode } from "@/parse/parser";
import { vhdlFile } from "./lib/vhdlFile";
import EditorScreen from "@/screens/EditorScreen.vue";
import SignalsScreen from "@/screens/SignalsScreen.vue";
import VCDromScreen from "@/screens/VCDromScreen.vue";

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
  <RouterView />
</template>

<style scoped></style>
