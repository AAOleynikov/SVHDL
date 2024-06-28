<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import { ScaleData } from "./WfTypes";
import { VCDSignal } from "@/vcd_tools/vcd2json";
const props = defineProps<{
  scaleData: ScaleData;
  waveformData: VCDSignal;
}>();

let leftIndex = ref(0); // Индекс последнего события, у которого timestamp не больше props.scaleData.leftBorder
let rightIndex = ref(props.waveformData.events.length - 1); // Индекс первого события, у которого timestamp не меньше props.scaleData.rightBorder

function updateIndex() {
  let newLeftIndex = leftIndex.value;
  let newRightIndex = rightIndex.value;
  while (props.waveformData[newLeftIndex] < props.scaleData.leftBorder)
    newLeftIndex++;
  while (props.waveformData[newLeftIndex] > props.scaleData.leftBorder)
    newLeftIndex--;

  while (props.waveformData[newRightIndex] > props.scaleData.rightBorder)
    newRightIndex--;
  while (props.waveformData[newRightIndex] < props.scaleData.rightBorder)
    newRightIndex++;
  leftIndex.value = newLeftIndex;
  rightIndex.value = newRightIndex;
}

watch(props.scaleData, () => {
  updateIndex();
});

type LineType = { x_from: number; x_to: number; type: "0" | "1" | "u" | "z" };
type LineChangeType = { x_center: number };
type HintTextType = { x: number; value: "0" | "1" | "u" | "z" };

type RenderDataType = {
  lines: LineType[];
  lineChanges: LineChangeType[];
  texts: HintTextType[];
};

const renderData = computed<RenderDataType>(() => {
  updateIndex();
  const out: RenderDataType = {
    lines: [],
    lineChanges: [],
    texts: [],
  };
  const scale =
    props.scaleData.plotsSectionWidth /
    (props.scaleData.rightBorder - props.scaleData.leftBorder);
  for (let i = leftIndex.value; i < rightIndex.value; i++) {
    const prevValue = props.waveformData.events[i].value;
    const value = props.waveformData.events[i].value;
    const leftFs = props.waveformData.events[i].timestamp;
    const rightFs = props.waveformData.events[i + 1].timestamp;
    const leftX = Math.round((leftFs - props.scaleData.leftBorder) * scale);
    const rightX = Math.round((rightFs - props.scaleData.leftBorder) * scale);
    out.lines.push({ x_from: leftX, x_to: rightX, type: value });
    if (prevValue != undefined && prevValue!=value) {
      out.lineChanges.push({ x_center: rightX });
    }
    const textLeftX = Math.max(leftX, 0);
    const textRightX = Math.min(rightX, props.scaleData.plotsSectionWidth);
    if (textRightX - textLeftX > 40) {
      out.texts.push({ x: Math.round((textRightX + textLeftX) / 2), value });
    }
  }
  return out;
});
</script>

<template>
  <div
    class="w-full min-w-full h-[40px] bg-slate-200 px-5 flex flex-row align-baseline">
    <svg width="10000" height="24" class="py-[8px] h-full">
      <template v-for="line of renderData.lines">
        <template v-if="line.type === 'u'">
          <line
            :x1="line.x_from"
            :x2="line.x_to"
            :y1="2"
            :y2="2"
            width="2"
            stroke="black"
            stroke-dasharray="4"></line>
          <line
            :x1="line.x_from"
            :x2="line.x_to"
            :y1="22"
            :y2="22"
            width="2"
            stroke="black"
            stroke-dasharray="4"></line>
        </template>
        <template v-if="line.type === 'z'">
          <line
            :x1="line.x_from"
            :x2="line.x_to"
            :y1="2"
            :y2="2"
            width="2"
            stroke="black"
            stroke-dasharray="4 4 1 4"></line>
          <line
            :x1="line.x_from"
            :x2="line.x_to"
            :y1="22"
            :y2="22"
            width="2"
            stroke="black"
            stroke-dasharray="4 4 1 4"></line>
        </template>
        <template v-if="line.type === '1'">
          <line
            :x1="line.x_from"
            :x2="line.x_to"
            :y1="2"
            :y2="2"
            width="2"
            stroke="green"></line>
        </template>
        <template v-if="line.type === '0'">
          <line
            :x1="line.x_from"
            :x2="line.x_to"
            :y1="22"
            :y2="22"
            width="2"
            stroke="red"></line>
        </template>
      </template>
      <template v-for="change of renderData.lineChanges">
        <line
          :x1="change.x_center"
          :x2="change.x_center"
          :y1="2"
          :y2="22"
          stroke="black"></line>
      </template>
      <template v-for="text of renderData.texts">
        <text
          :x="text.x"
          y="16"
          class="monospaceFont"
          :stroke="
            { '1': 'green', '0': 'red', u: 'black', z: 'gray' }[text.value]
          ">
          {{ text.value }}
        </text>
      </template>
    </svg>
  </div>
</template>
