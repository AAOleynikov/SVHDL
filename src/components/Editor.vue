<script setup>
import { ref } from "vue";
console.log("Hello!");

const code = ref("this\nis\ntest\code\nfish");
</script>

<template>
  <div class="flex-grow flex flex-col">
    <vue-monaco-editor
      style="height: 100%; width: 100%; flex-grow: 1;"
      v-model:value="code"
    />
  </div>
</template>

<style scoped></style>
