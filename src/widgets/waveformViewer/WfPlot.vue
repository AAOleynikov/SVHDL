<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import { BitValue, ScaleData } from "@/entities/waveform";
import { VCDSignal } from "@/entities/parsedVcd";
import { BitPlotData, VectorPlotData } from "@/features/richVcd";
const { scaleData, plotData } = defineProps<{
  scaleData: ScaleData;
  plotData: VectorPlotData | BitPlotData;
}>();

interface RenderInterval {
  key: number;
  type: BitValue | "vector";
  leftX: number;
  rightX: number;
  text: string;
}

const renderData = computed<RenderInterval[]>(() => {
  const data = plotData.getWindowData({
    leftTime: scaleData.leftBorder,
    rightTime: scaleData.rightBorder,
  });

  return [];
});
</script>

<template>
  <div
    class="w-full min-w-full h-[40px] bg-slate-200 px-5 flex flex-row align-baseline">
    <svg width="10000" height="24" class="py-[8px] h-full">
      <template v-for="interval of renderData" :key="interval.key">
        <template v-if="interval.type === 'x'">
          <line
            :x1="interval.leftX"
            :x2="interval.rightX"
            :y1="2"
            :y2="2"
            width="2"
            stroke="black"
            stroke-dasharray="4"></line>
          <line
            :x1="interval.leftX"
            :x2="interval.rightX"
            :y1="22"
            :y2="22"
            width="2"
            stroke="black"
            stroke-dasharray="4"></line>
        </template>
        <template v-if="interval.type === 'z'">
          <line
            :x1="interval.leftX"
            :x2="interval.rightX"
            :y1="2"
            :y2="2"
            width="2"
            stroke="black"
            stroke-dasharray="4 4 1 4"></line>
          <line
            :x1="interval.leftX"
            :x2="interval.rightX"
            :y1="22"
            :y2="22"
            width="2"
            stroke="black"
            stroke-dasharray="4 4 1 4"></line>
        </template>
        <template v-if="interval.type === '1'">
          <line
            :x1="interval.leftX"
            :x2="interval.rightX"
            :y1="2"
            :y2="2"
            width="2"
            stroke="green"></line>
        </template>
        <template v-if="interval.type === '0'">
          <line
            :x1="interval.leftX"
            :x2="interval.rightX"
            :y1="22"
            :y2="22"
            width="2"
            stroke="red"></line>
        </template>
      </template>
    </svg>
  </div>
</template>
