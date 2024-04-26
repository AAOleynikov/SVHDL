<script setup>
import { ref, reactive } from "vue";
import SignalWizard from "@/components/SignalWizard.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "radix-vue";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const signals = defineModel();

console.log("Hello!");
</script>

<template>
  <div class="flex-grow flex flex-col pr-3 pl-3">
    <span class="mb-2"
      >Задать параметры симуляции <Button>Запустить</Button></span
    >
    <!-- <SliderRoot
      v-model="sliderValue"
      class="relative flex items-center select-none touch-none w-full"
      :max="100"
      :step="1"
    >
      <SliderTrack
        class="block relative grow h-20 border-2 border-slate-800 rounded-md"
      >
        <SliderRange class="absolute bg-slate-500 rounded-[0.26rem] h-full" />
      </SliderTrack>
      <SliderThumb
        class="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8"
        aria-label="Volume"
      />
      <SliderThumb
        class="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8"
        aria-label="Volume"
      />
    </SliderRoot> -->
    <h2>{{ signals.length }} signals</h2>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Signal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="signal in signals">
          <TableCell className="font-medium">{{ signal.name }}</TableCell>
          <TableCell>{{ signal.type }}</TableCell>
          <TableCell><SignalWizard /></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped></style>
