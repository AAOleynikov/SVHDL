<script setup>
import { onMounted } from "vue";

onMounted(() => {
  VCDrom("waveform1");
});
</script>

<template>
  <div class="h-full">
    <div id="waveform1"></div>
  </div>
</template>

<style>
.wd-progress {
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  transform: translate(0, 300) !important;
  width: 100%;
  height: 100%;
  z-index: -10;
}
</style>
