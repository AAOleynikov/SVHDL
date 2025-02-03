<script setup>
import { cn } from "@/shared/tailwind";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div class="relative w-full h-full overflow-auto grow">
    <table :class="cn('w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
