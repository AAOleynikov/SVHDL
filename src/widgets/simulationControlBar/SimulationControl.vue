<script setup lang="ts">
import { TooltipProvider } from "@/components/ui/tooltip";
import TooltipButton from "@/shared/components/wave"
import TimeInput from "../TimeInput.vue";
import ScaleWizard from "../../../widgets/waveformViewer/ScaleWizard.vue";
import { ScaleData } from "@/entities/waveform";

const scaleData = defineModel<ScaleData>({ required: true });
</script>

<template>
  <div class="mb-2 border-2 border-slate-200 bg-white rounded-md px-2 py-1">
    <TooltipProvider>
      <div class="flex flex-row justify-between">
        <div class="flex flex-row flex-wrap gap-y-1 gap-x-3">
          <div>
            <TooltipButton icon="bi-input-cursor" tooltip="Cursor tool" />
            <TooltipButton icon="bi-arrows-move" tooltip="Move tool" />
          </div>
          <div class="border-s-[1px]">
            <TooltipButton icon="bi-eye-slash" tooltip="Hide/Show selected" />
            <TooltipButton icon="bi-eyeglasses" tooltip="Show only hidden" />
            <TooltipButton icon="bi-sunrise" tooltip="Unhide all" />
          </div>
          <div class="border-s-[1px]">
            <TooltipButton icon="bi-1-square" tooltip="Collapse to level 1" />
            <TooltipButton icon="bi-2-square" tooltip="Collapse to level 2" />
            <TooltipButton icon="bi-3-square" tooltip="Collapse to level 3" />
            <TooltipButton icon="bi-4-square" tooltip="Collapse to level 4" />
            <TooltipButton icon="bi-0-square" tooltip="Uncollapse all levels" />
          </div>
          <div class="border-s-[1px]">
            <TooltipButton icon="bi-download" tooltip="Download VCD" />
            <TooltipButton
              icon="bi-file-earmark-arrow-down"
              tooltip="Download testbench (VHDL)" />
          </div>
          <div class="border-s-[1px] flex flex-row items-center pl-2">
            <span class="mr-5">CMT: 100ns</span>
            <span class="mr-2">Step size: </span>
            <TimeInput v-model="scaleData.step" />
            <TooltipButton icon="bi-fast-forward-fill" tooltip="Make step" />
          </div>
          <div class="border-s-[1px] flex flex-row items-center pl-2">
            <ScaleWizard />
          </div>
        </div>
        <div class="border-s-[1px]">
          <TooltipButton icon="bi-trash" tooltip="Stop simulation and reset" />
        </div>
      </div>
    </TooltipProvider>
  </div>
</template>
