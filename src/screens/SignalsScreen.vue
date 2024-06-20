<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import SignalWizard from "@/components/SignalWizard.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const ide_state = defineModel<IDEState>();

console.log("Hello!");
</script>

<template>
  <div class="flex-grow flex flex-col pr-3 pl-3">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">Entity</TableHead>
          <TableHead class="w-[100px]">ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Signal</TableHead>
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
              <TableCell><SignalWizard v-model="entry[1]" /></TableCell>
            </TableRow>
          </template>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped></style>
