<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import SignalWizard from "@/components/SignalWizard.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TimeInput from "@/components/TimeInput.vue";
import { ParsedVhdlFile } from "@/lib/parsedFile";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IDEState } from "@/lib/ideState";
import { Time } from "@/lib/measureUnits";

const ide_state = defineModel<IDEState>({ required: true });
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
        <template v-if="ide_state.stymulusState.stymulusList !== undefined">
          <template
            v-for="entry of ide_state.stymulusState.stymulusList.entries()">
            <TableRow>
              <TableCell className="font-medium">in</TableCell>
              <TableCell className="font-medium">{{ entry[0] }}</TableCell>
              <TableCell>std_logic</TableCell>
              <TableCell
                ><SignalWizard
                  :modelValue="entry[1]"
                  @update:modelValue="
                    ($event) => {
                      ide_state.stymulusState.stymulusList.set(
                        entry[0],
                        $event
                      );
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
        @click="ide_state.startSimulation(firstStepTime)"
        >Simulate!</Button
      >
    </div>
  </div>
</template>

<style scoped></style>
