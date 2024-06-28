<script setup lang="ts">
import { defineProps } from "vue";
import { DisplayData } from "./WfTypes";

const props = defineProps<{ data: DisplayData }>();
const emit=defineEmits(["fold","unfold"])
</script>

<template>
  <div class="w-full h-[40px] bg-slate-200 px-5 flex flex-row align-baseline">
    <div class="w-5 min-w-5" v-for="i of new Array(props.data.level)"></div>
    <div class="w-8 min-w-8" v-if="props.data.type==='scope'">
      <i class="bi-plus-square text-2xl cursor-pointer" v-if="props.data.expanded===false" @click="emit('unfold')"></i>
      <i class="bi-dash-square text-2xl cursor-pointer" v-if="props.data.expanded===true" @click="emit('fold')"></i>
    </div>
    <span class="text-2xl monospaceFont">{{ props.data.name }}</span>
  </div>
</template>
