<script setup>
import { reactive, ref, watch } from "vue";
import Editor from "./components/Editor.vue";
import FileTree from "./components/FileTree.vue";
import NavBar from "./components/NavBar.vue";
import Button from "./components/ui/button/Button.vue";
import VC from "./components/VC.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import sampleCode from "@/sample.vhd?raw";
import { processCode } from "@/parse/parser";

var mock = reactive([
  {
    title: "Books",
    expanded: true,
    folder: true,
    children: [
      {
        title: "Art of War",
        type: "book",
        author: "Sun Tzu",
        year: -500,
        qty: 21,
        price: 5.95,
      },
      {
        title: "The Hobbit",
        type: "book",
        author: "J.R.R. Tolkien",
        year: 1937,
        qty: 32,
        price: 8.97,
      },
      {
        title: "The Little Prince",
        type: "book",
        author: "Antoine de Saint-Exupery",
        year: 1943,
        qty: 2946,
        price: 6.82,
      },
      {
        title: "Don Quixote",
        type: "book",
        author: "Miguel de Cervantes",
        year: 1615,
        qty: 932,
        price: 15.99,
      },
    ],
  },
  {
    title: "Music",
    folder: true,
    children: [
      {
        title: "Nevermind",
        type: "music",
        author: "Nirvana",
        year: 1991,
        qty: 916,
        price: 15.95,
      },
      {
        title: "Autobahn",
        type: "music",
        author: "Kraftwerk",
        year: 1974,
        qty: 2261,
        price: 23.98,
      },
      {
        title: "Kind of Blue",
        type: "music",
        author: "Miles Davis",
        year: 1959,
        qty: 9735,
        price: 21.9,
      },
      {
        title: "Back in Black",
        type: "music",
        author: "AC/DC",
        year: 1980,
        qty: 3895,
        price: 17.99,
      },
      {
        title: "The Dark Side of the Moon",
        type: "music",
        author: "Pink Floyd",
        year: 1973,
        qty: 263,
        price: 17.99,
      },
      {
        title: "Sgt. Pepper's Lonely Hearts Club Band",
        type: "music",
        author: "The Beatles",
        year: 1967,
        qty: 521,
        price: 13.98,
      },
    ],
  },
  {
    title: "Electronics & Computers",
    expanded: true,
    folder: true,
    children: [
      {
        title: "Cell Phones",
        folder: true,
        children: [
          {
            title: "Moto G",
            type: "phone",
            author: "Motorola",
            year: 2014,
            qty: 332,
            price: 224.99,
          },
          {
            title: "Galaxy S8",
            type: "phone",
            author: "Samsung",
            year: 2016,
            qty: 952,
            price: 509.99,
          },
          {
            title: "iPhone SE",
            type: "phone",
            author: "Apple",
            year: 2016,
            qty: 444,
            price: 282.75,
          },
          {
            title: "G6",
            type: "phone",
            author: "LG",
            year: 2017,
            qty: 951,
            price: 309.99,
          },
          {
            title: "Lumia",
            type: "phone",
            author: "Microsoft",
            year: 2014,
            qty: 32,
            price: 205.95,
          },
          {
            title: "Xperia",
            type: "phone",
            author: "Sony",
            year: 2014,
            qty: 77,
            price: 195.95,
          },
          {
            title: "3210",
            type: "phone",
            author: "Nokia",
            year: 1999,
            qty: 3,
            price: 85.99,
          },
        ],
      },
      {
        title: "Computers",
        folder: true,
        children: [
          {
            title: "ThinkPad",
            type: "computer",
            author: "IBM",
            year: 1992,
            qty: 16,
            price: 749.9,
          },
          {
            title: "C64",
            type: "computer",
            author: "Commodore",
            year: 1982,
            qty: 83,
            price: 595.0,
          },
          {
            title: "MacBook Pro",
            type: "computer",
            author: "Apple",
            year: 2006,
            qty: 482,
            price: 1949.95,
          },
          {
            title: "Sinclair ZX Spectrum",
            type: "computer",
            author: "Sinclair Research",
            year: 1982,
            qty: 1,
            price: 529,
          },
          {
            title: "Apple II",
            type: "computer",
            author: "Apple",
            year: 1977,
            qty: 17,
            price: 1298,
          },
          {
            title: "PC AT",
            type: "computer",
            author: "IBM",
            year: 1984,
            qty: 3,
            price: 1235.0,
          },
        ],
      },
    ],
  },
  { title: "More...", folder: true, lazy: true },
]);

//Одно из следующих: vhdl, sigs, vcd
const state = ref("vhdl");

const code = ref(sampleCode);

// В установку сигналов
const fileParse = reactive([]);

watch(state, (newState, oldState) => {
  if (oldState == "vhdl" && newState == "sigs") {
    fileParse.value = [];
    const newData = processCode(code.value);
    console.log(newData);
    for (let arch of newData.architectures) {
      for (let sig of arch.signals) {
        fileParse.push(sig);
        console.log("here");
      }
    }
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
    </template>
  </div>
</template>

<style scoped></style>
