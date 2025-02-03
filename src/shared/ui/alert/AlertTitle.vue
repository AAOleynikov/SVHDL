<script setup lang="ts">
import { cn } from "@/shared/tailwind";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <h5 :class="cn('mb-1 font-medium leading-none tracking-tight', props.class)">
    <slot />
  </h5>
</template>
