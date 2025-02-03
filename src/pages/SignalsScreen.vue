<script setup lang="ts">
import { ref } from "vue";
import SignalWizard from "@/shared/components/SignalWizard.vue";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import TimeInput from "@/shared/components/TimeInput.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { StymulusConfig } from "@/lib/ideState";
import { Time } from "@/entities/time";

const stymulusState = defineModel<StymulusConfig>({ required: true });
const { startSimulation } = defineProps<{
  startSimulation: (firstStepTime: Time) => void;
}>();
const firstStepTime = ref<Time>({ mantissa: 100, exponent: "ns" });
</script>

<template>
  <div class="flex-grow flex flex-col pr-3 pl-3 gap-5">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">Mode</TableHead>
          <TableHead class="w-[100px]">Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Stymulus</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="stymulusState.stymulusList !== undefined">
          <template
            v-for="entry of stymulusState.stymulusList.entries()"
            :key="entry[0]">
            <TableRow>
              <TableCell class-name="font-medium">in</TableCell>
              <TableCell class-name="font-medium">{{ entry[0] }}</TableCell>
              <TableCell>std_logic</TableCell>
              <TableCell
                ><SignalWizard
                  :modelValue="entry[1]"
                  @update:modelValue="
                    ($event) => {
                      stymulusState.stymulusList.set(entry[0], $event);
                    }
                  "
              /></TableCell>
            </TableRow>
          </template>
        </template>
      </TableBody>
    </Table>
    <div class="flex flex-row gap-2 items-center">
      <Label>First step time</Label><TimeInput v-model="firstStepTime" /><Button
        @click="startSimulation(firstStepTime)"
        >Simulate!</Button
      >
    </div>
  </div>
</template>

<style scoped></style>
