<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import Button from "@/shared/components/ui/button/Button.vue";
const props = defineProps<{
  icon: string;
  tooltip: string;
}>();
const emit = defineEmits(["click"]);
</script>

<template>
  <Tooltip>
    <TooltipTrigger>
      <Button variant="link" size="icon" @click="emit('click')">
        <i :class="props.icon"></i>
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{{ props.tooltip }}</p>
    </TooltipContent>
  </Tooltip>
</template>
