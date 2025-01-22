<script setup lang="ts">
import SimulationControl from "@/components/waveform/SimulationControl.vue";
import WfLabel from "@/components/waveform/WfLabel.vue";
import WfPlot from "@/components/waveform/WfPlot.vue";
import TimeScale from "@/components/waveform/TimeScale.vue";
import {
  ScaleData,
  DisplayData,
  WaveFormData,
} from "@/components/waveform/WfTypes";
import { ref, reactive, computed, onMounted, watch } from "vue";
import { VCDScope, parseVCD } from "@/vcd_tools/vcd2json";
import { usePointerSwipe, useScroll } from "@vueuse/core";

import { IDEState } from "@/lib/ideState";

const ide_state = defineModel<IDEState>();
const vcdData = parseVCD(ide_state.value.vcd);

const vcdState = reactive<WaveFormData[]>([]);

function recursiveLoadVcdState(
  where: WaveFormData[],
  what: VCDScope
): undefined {
  const newChildren: WaveFormData[] = [];
  for (const variable of what.signals) {
    newChildren.push({ type: "var", name: variable.name, data: variable });
  }
  const newFolder: WaveFormData = {
    type: "scope",
    expanded: true,
    name: what.name,
    children: newChildren,
  };
  for (const subScope of what.childScopes) {
    recursiveLoadVcdState(newFolder.children, subScope);
  }
  where.push(newFolder);
}
for (const scope of vcdData.scopes) {
  recursiveLoadVcdState(vcdState, scope);
}

function recursiveLoadDisplayState(
  ret: DisplayData[],
  what: WaveFormData,
  level: number
) {
  if (
    level === 0 &&
    what.type === "scope" &&
    (what.name === "standard" || what.name === "std_logic_1164")
  )
    return;
  if (what.type === "scope") {
    ret.push({
      type: "scope",
      name: what.name,
      expanded: what.expanded,
      level,
      data: what,
    });
    if (what.expanded)
      for (const sig of what.children) {
        recursiveLoadDisplayState(ret, sig, level + 1);
      }
  } else if (what.type === "var") {
    ret.push({
      type: "bit",
      data: what.data,
      name: what.name,
      level,
      events: [],
    });
  }
}

const displayState = computed(() => {
  const ret: DisplayData[] = [];
  for (const dd of vcdState) recursiveLoadDisplayState(ret, dd, 0);
  return ret;
});

const labelsResizeGrip = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const plotsSection = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const plotsScrollControlDiv = ref<InstanceType<typeof HTMLDivElement> | null>(
  null
);

usePointerSwipe(labelsResizeGrip, {
  onSwipe: (e) => {
    scaleData.labelsWidth += e.movementX;
    scaleData.plotsSectionWidth -= e.movementX;
  },
  threshold: 1,
});

const scaleData = reactive<ScaleData>({
  leftBorder: 0,
  rightBorder: Math.round(ide_state.value.curSTime / 3),
  labelsWidth: 500,
  plotsSectionWidth: 500,
  mode: "cursor",
  currentSimTime: ide_state.value.curSTime,
  step: { mantissa: 100, exponent: "ns" },
});

const plotsPlaceholderWidth = computed(() => {
  return Math.floor(
    (scaleData.currentSimTime /
      (scaleData.rightBorder - scaleData.leftBorder)) *
      scaleData.plotsSectionWidth
  );
});

onMounted(() => {
  scaleData.plotsSectionWidth = plotsSection.value.clientWidth;
});
const _useScrollPlots = useScroll(plotsScrollControlDiv, {});
const x = _useScrollPlots.x;
watch(x, () => {
  const maxX = plotsPlaceholderWidth.value - scaleData.plotsSectionWidth;
  const offsetNormalized = x.value / maxX; // Значение между 0 и 1
  const leftBorderMax =
    scaleData.currentSimTime - (scaleData.rightBorder - scaleData.leftBorder);
  const newLeftBorder = Math.round(leftBorderMax * offsetNormalized);
  const newRightBorder =
    newLeftBorder + (scaleData.rightBorder - scaleData.leftBorder);
  scaleData.rightBorder = newRightBorder;
  scaleData.leftBorder = newLeftBorder;
});
</script>

<template>
  <div
    class="bg-white w-full min-w-full max-h-full flex-grow pt-2 px-10 box-border fixed">
    <div class="min-h-full max-h-full">
      <SimulationControl v-model="scaleData" />

      <div class="flex-grow flex flex-row max-h-4/5">
        <div
          class="bg-white min-h-full"
          :style="{
            width: scaleData.labelsWidth + 'px',
            'min-width': scaleData.labelsWidth + 'px',
          }">
          <div class="overflow-x-scroll w-full">
            <div style="min-width: 1px; height: 1px"></div>
          </div>
          <div class="min-h-[40px] bg-white"></div>
        </div>
        <div class="max-width-0">
          <div
            ref="labelsResizeGrip"
            class="fixed w-[3px] min-w-[3px] bg-gray-700 h-screen cursor-ew-resize"></div>
        </div>
        <div
          class="min-h-full bg-green-200"
          style="width: 3px; min-width: 3px"></div>
        <div
          ref="plotsSection"
          class="min-h-full max-h-full bg-white"
          :style="{ 'min-width': 300 + 'px' }">
          <div ref="plotsScrollControlDiv" class="overflow-x-scroll">
            <div
              :style="{
                'min-width': plotsPlaceholderWidth + 'px',
                height: 1 + 'px',
              }"></div>
          </div>
          <TimeScale :scale-data="scaleData" />
        </div>
      </div>
    </div>
  </div>
  <div class="pt-[122px] pb-10 px-10 w-full">
    <div class="flex-grow flex flex-row">
      <div
        class="bg-red-200 min-h-full"
        :style="{
          width: scaleData.labelsWidth + 'px',
          'min-width': scaleData.labelsWidth + 'px',
        }">
        <template v-for="(ddd, idx) of displayState" :key="idx">
          <WfLabel
            :data="ddd"
            @fold="
              () => {
                if (ddd.type === 'scope') ddd.data.expanded = false;
              }
            "
            @unfold="
              () => {
                if (ddd.type === 'scope') ddd.data.expanded = true;
              }
            " />
        </template>
      </div>
      <div class="min-h-full bg-white" style="width: 3px; min-width: 3px"></div>
      <div
        class="min-h-full max-h-full w-full bg-white"
        :style="{ 'min-width': 300 + 'px' }">
        <template v-for="(ddd, idx) of displayState" :key="idx">
          <div
            v-if="ddd.type === 'scope'"
            class="bg-white min-h-[40px] w-full min-w-full"></div>
          <WfPlot
            v-if="ddd.type === 'bit'"
            :scale-data="scaleData"
            :waveform-data="ddd.data" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
