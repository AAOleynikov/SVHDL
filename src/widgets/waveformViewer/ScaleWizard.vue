<script setup lang="ts">
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import Button from "@/shared/components/ui/button/Button.vue";
import TooltipButton from "./TooltipButton.vue";
import Separator from "@/shared/components/ui/separator/Separator.vue";
import { Label } from "@/shared/components/ui/label";
import TimeInput from "@/shared/components/TimeInput.vue";
import { noop } from "@vueuse/core";
</script>

<template>
  <span>Viewport: 100ns</span>
  <Popover>
    <PopoverTrigger as-child>
      <TooltipButton icon="bi-pencil" tooltip="Edit scale" />
    </PopoverTrigger>
    <PopoverContent class-name="w-72">
      <div class="flex flex-col items-center align-baseline">
        <div class="flex flex-row justify-around w-full">
          <TooltipButton icon="bi-zoom-in" tooltip="Zoom in" />
          <TooltipButton icon="bi-zoom-out" tooltip="Zoom out" />
          <TooltipButton
            icon="bi-arrows-fullscreen"
            tooltip="Show full timeline" />
        </div>
        <Separator orientation="horizontal" class="my-2" />
        <div class="flex flex-col justify-around w-full">
          <div>
            <Label>Left Border</Label>
            <TimeInput
              :model-value="{ mantissa: 10, exponent: 'ns' }"
              @update:model-value="noop" />
          </div>
          <div>
            <Label>Right Border</Label>
            <TimeInput
              :model-value="{ mantissa: 10, exponent: 'ns' }"
              @update:model-value="noop" />
          </div>
          <Button><i class="bi-check-lg"></i> Apply</Button>
        </div>
        <Separator orientation="horizontal" class="my-2" />
        <div class="flex flex-col justify-around w-full">
          <div>
            <Label>Cursor Position</Label>
            <TimeInput
              :model-value="{ mantissa: 10, exponent: 'ns' }"
              @update:model-value="noop" />
          </div>
          <div>
            <Label>ViewPort width</Label>
            <TimeInput
              :model-value="{ mantissa: 10, exponent: 'ns' }"
              @update:model-value="noop" />
          </div>
          <Button><i class="bi-check-lg"></i> Apply</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
