<script setup>
import { ref } from 'vue';
console.log("Hello!");

const code=ref("this\nis\ntest\code\nfish")
</script>

<template>
  <vue-monaco-editor style="height: 400px;width:100%" v-model:value="code" />
</template>

<style scoped>

</style>
