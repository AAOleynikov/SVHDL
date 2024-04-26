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

import { vhdlFile } from "@/lib/vhdlFile";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const vhdlf = defineModel();

console.log("Hello!");
</script>

<template>
  <div class="flex-grow flex flex-col pr-3 pl-3">
    <span class="mb-2">
      Задать параметры симуляции <Button>Запустить</Button>
    </span>
    <h2>Found {{ vhdlf.value.architectures.length }}</h2>
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
        <template v-for="architecture in vhdlf.value.architectures">
          <TableRow>
            <h2>Signals of architecture {{ architecture.name }}</h2>
          </TableRow>
          <TableRow v-for="signal in architecture.signals">
            <TableCell className="font-medium">{{ signal.type }}</TableCell>
            <TableCell className="font-medium">{{ signal.name }}</TableCell>
            <TableCell>{{ signal.type }}</TableCell>
            <TableCell><SignalWizard /></TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped></style>
