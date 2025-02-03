<script setup lang="ts">
import { defineProps } from "vue";
import { DisplayData } from "@/entities/waveform"

const props = defineProps<{ data: DisplayData }>();
const emit = defineEmits(["fold", "unfold"]);
</script>

<template>
  <div class="w-full h-[40px] bg-slate-200 px-5 flex flex-row align-baseline">
    <div
      v-for="(i, idx) of new Array(props.data.level)"
      :key="idx"
      class="w-5 min-w-5"></div>
    <div v-if="props.data.type === 'scope'" class="w-8 min-w-8">
      <i
        v-if="props.data.expanded === false"
        class="bi-plus-square text-2xl cursor-pointer"
        @click="emit('unfold')"></i>
      <i
        v-if="props.data.expanded === true"
        class="bi-dash-square text-2xl cursor-pointer"
        @click="emit('fold')"></i>
    </div>
    <span class="text-2xl monospaceFont">{{ props.data.name }}</span>
  </div>
</template>
