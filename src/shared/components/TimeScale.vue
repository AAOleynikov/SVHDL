<script setup lang="ts">
import { defineProps, onMounted, ref, computed, watch } from "vue";
import { generateBins } from "@/shared/utils/generateBins";
import { ScaleData } from "@/entities/waveform";
import { Time } from "@/entities/time";

const props = defineProps<{ scaleData: ScaleData }>();

const numBins = ref<number>(5);
const scaleWidth = ref<number>(9999); // Ширина шкалы
const container = ref<InstanceType<typeof HTMLDivElement> | null>(null); // DOM основного div'а шкалы

function updateSizes() {
  if (container.value === null) {
    throw new Error("");
  }
  numBins.value = Math.ceil((container.value.clientWidth - 100) / 100);
  scaleWidth.value = container.value.clientWidth;
}

const bins = computed(() => {
  return generateBins(
    props.scaleData.leftBorder.toFs(),
    props.scaleData.rightBorder.toFs(),
    numBins.value
  );
});

const binsX = computed(() => {
  const scale =
    (props.scaleData.rightBorder.toFs() - props.scaleData.leftBorder.toFs()) /
    scaleWidth.value;
  return bins.value.map((a) => {
    return {
      value: a,
      x: Math.ceil((a - props.scaleData.leftBorder.toFs()) / scale + 0.01),
    };
  });
});

onMounted(() => {
  updateSizes();
});

watch(
  () => props.scaleData.labelsWidth,
  () => {
    updateSizes();
  }
);
</script>

<template>
  <div ref="container" class="w-full min-w-full h-[40px]">
    <svg height="40px" class="select-none" :width="scaleWidth">
      <line
        x1="0"
        y1="1"
        :x2="scaleWidth"
        y2="1"
        width="2"
        stroke="black"></line>
      <template v-for="(bin, idx) of binsX" :key="idx">
        <line
          :x1="bin.x"
          y1="1"
          :x2="bin.x"
          y2="15"
          width="2"
          stroke="black"></line>
        <text :x="bin.x" y="32" class="monospaceFont">
          {{ Time.fromFs(bin.value).toEngineeringNotation() }}
        </text>
      </template>
    </svg>
  </div>
</template>
