<script setup lang="ts">
const props = defineProps<{
  type: "hotkey" | "controlled";
  hotkey: string | undefined;
  isActive: boolean;
}>();
</script>

<template>
  <div>
    {{ props.hotkey }}
  </div>
</template>
