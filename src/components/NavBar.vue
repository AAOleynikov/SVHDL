<script setup lang="ts">
import "@/assets/css/index.css";
import { IDEState } from "@/lib/ideState";
import { defineProps, ref, watch } from "vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateTransition } from "@/lib/validateTransition";
import { Screen, useUIStore } from "@/stores/ui";

const ide_state = defineModel<IDEState>();
const props = defineProps(["persTimer"]);

const decryptions = [
  "Super",
  "Student",
  "Simple",
  "Start",
  "Sketch",
  "SAPR's",
  "Sanction't",
  "Smile",
  "Strong",
  "Secret",
  "Standard",
  "Ssssssss",
  "Syrup",
  "Sugar",
  "Seek",
  "Soul",
];
const thisDecryption = ref("S");

const ui = useUIStore();
const screen = ref<Screen>(ui.activeScreen);

watch(screen, (newValue, oldValue) => {
  const newScr = validateTransition(ide_state.value, oldValue, newValue);
  screen.value = newScr;
  if (ui.activeScreen !== newScr) {
    ui.activeScreen = newScr;
  }
});

watch(
  () => ui.activeScreen,
  () => {
    screen.value = ui.activeScreen;
  }
);
</script>

<template>
  <nav>
    <div
      class="flex flex-row justify-between align-middle p-4 fixed w-screen min-w-screen"
      style="
        height: 70px;
        max-height: 70px;
        border-bottom: 2px solid;
        border-bottom-color: gray;
        background: linear-gradient(
          0deg,
          rgba(180, 180, 180, 1) 0%,
          rgba(196, 196, 196, 1) 100%
        );
      ">
      <div class="flex flex-row gap-3 items-center">
        <img
          src="/src/assets/img/LOGO.png"
          style="width: 40px; border-radius: 20px" />
        <b
          ><a class="text-xl"
            ><span
              style="cursor: pointer"
              @click="
                thisDecryption =
                  decryptions[
                    Math.floor((Math.random() * 100) % decryptions.length)
                  ]
              "
              >{{ thisDecryption }}</span
            >VHDL</a
          ></b
        >
        <i
          :class="{
            'bi-check-all': props.persTimer === undefined,
            'bi-clock': props.persTimer != undefined,
          }"></i>
      </div>

      <Tabs
        v-model:model-value="screen"
        activation-mode="manual"
        default-value="account"
        class-name="w-[600px]">
        <TabsList class-name="grid w-full grid-cols-3 h-full">
          <TabsTrigger value="vhdl">
            <i class="bi-code-slash pr-2"></i> VHDL code editing
          </TabsTrigger>
          <TabsTrigger value="stymulus">
            <i class="bi-yelp pr-2"></i> Signal Setting
          </TabsTrigger>
          <TabsTrigger value="waveform">
            <i class="bi-bar-chart-steps pr-2"></i> Postprocessing
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div class="flex flex-row gap-3">
        <a href="https://t.me/azazelit" class="bg-blue-400 rounded-full h-8 w-8"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg
        ></a>
        <a
          class="bg-blue-400 rounded-full h-8 w-8"
          href="https://vk.com/donantoniochehonte"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-brand-vk">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              d="M14 19h-4a8 8 0 0 1 -8 -8v-5h4v5a4 4 0 0 0 4 4h0v-9h4v4.5l.03 0a4.531 4.531 0 0 0 3.97 -4.496h4l-.342 1.711a6.858 6.858 0 0 1 -3.658 4.789h0a5.34 5.34 0 0 1 3.566 4.111l.434 2.389h0h-4a4.531 4.531 0 0 0 -3.97 -4.496v4.5z" /></svg
        ></a>
        <a
          class="bg-blue-400 rounded-full h-8 w-8"
          href="https://github.com/AAOleynikov">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" /></svg
        ></a>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
