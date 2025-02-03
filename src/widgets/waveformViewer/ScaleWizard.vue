<script setup lang="ts">
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Button from "../ui/button/Button.vue";
import TooltipButton from "./TooltipButton.vue";
import Separator from "../ui/separator/Separator.vue";
import Label from "../ui/label/Label.vue";
import TimeInput from "../TimeInput.vue";
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
            <TimeInput />
          </div>
          <div>
            <Label>Right Border</Label>
            <TimeInput />
          </div>
          <Button><i class="bi-check-lg"></i> Apply</Button>
        </div>
        <Separator orientation="horizontal" class="my-2" />
        <div class="flex flex-col justify-around w-full">
          <div>
            <Label>Cursor Position</Label>
            <TimeInput />
          </div>
          <div>
            <Label>ViewPort width</Label>
            <TimeInput />
          </div>
          <Button><i class="bi-check-lg"></i> Apply</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
