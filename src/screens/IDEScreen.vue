<script setup>
import { ref } from 'vue';
import EditorScreen from './EditorScreen.vue';
import SignalsScreen from './SignalsScreen.vue';
import NavBar from '@/components/NavBar.vue';

const state=ref('vhdl')
</script>

<template>
  <div class="h-screen max-h-screen flex flex-col">
    <NavBar v-model:editor-state="state" />
    <template v-if="state == 'vhdl'">
      <EditorScreen />
    </template>
    <template v-if="state == 'sigs'">
      <SignalsScreen v-model="fileParse" />
    </template>
    </div>
</template>
