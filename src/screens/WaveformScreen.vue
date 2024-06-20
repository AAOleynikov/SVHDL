<script setup lang="ts">
import { computed, reactive } from "vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { IDEState } from "@/lib/ideState";
import SimulationControl from "@/components/waveform/SimulationControl.vue";
import WfLabel from "@/components/waveform/WfLabel.vue";
import WfPlot from "@/components/waveform/WfPlot.vue";
export type WaveFormScope = {
  type: "scope";
  expanded: boolean;
  name: string;
  children?: WaveFormData[];
};
export type WaveFormVariable = {
  type: "var";
  name: string;
};
export type WaveFormData = WaveFormScope | WaveFormVariable;

const ide_state = defineModel<IDEState>();

const data = reactive<WaveFormData[]>([
  {
    expanded: true,
    name: "Collapsed1",
    type: "scope",
    children: [
      { name: "Var1", type: "var" },
      { name: "Var2", type: "var" },
      { name: "Var3", type: "var" },
    ],
  },
  {
    expanded: true,
    name: "Collapsed2",
    type: "scope",
    children: [
      { name: "Var1", type: "var" },
      { name: "Var2", type: "var" },
      { name: "Var3", type: "var" },
    ],
  },
]);

const serializedData = computed(() => {
  const ret = [];
});
</script>

<template>
  <div class="mx-5 mt-3 mb-0 flex-grow box-border flex flex-col-reverse">
    <!-- ResizablePanelGroup ебёт мозги. У меня не получилось сделать так,
       чтобы сверху него был какой-то div, поэтому используется flex-reverse -->
    <div class="flex-grow border-slate-200 border-2 border-b-0 rounded-t-md">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel id="panel2" :min-size="10"
          ><div class="flex flex-col overflow-x-auto">
            <WfLabel />
            <WfLabel />
            <WfLabel />
            <WfLabel />
            <WfLabel />
            <WfLabel /></div
        ></ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="panel2" :min-size="10"
          ><div class="flex flex-col overflow-x-auto">
            <WfPlot />
            <WfPlot />
            <WfPlot />
            <WfPlot />
            <WfPlot />
            <WfPlot /></div
        ></ResizablePanel>
      </ResizablePanelGroup>
    </div>
    <SimulationControl />
  </div>
</template>
