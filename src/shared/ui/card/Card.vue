<script setup lang="ts">
import { cn } from "@/shared/tailwind";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    :class="
      cn(
        'rounded-xl border border-slate-200 bg-white text-slate-950 shadow dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
