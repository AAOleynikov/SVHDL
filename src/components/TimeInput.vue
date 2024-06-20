<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Input from "./ui/input/Input.vue";
import { ref, watch } from "vue";

const exps = { f: 1, p: 1e3, n: 1e6, u: 1e9, m: 1e12, exact: 1e15 };

const value = defineModel<number>();
const exponent = ref("n");
const mantissa = ref<number>(1);

watch(exponent, () => {
  value.value = mantissa.value * exps[exponent.value];
});

watch(mantissa, () => {
  value.value = mantissa.value * exps[exponent.value];
});
</script>

<template>
  <div class="flex flex-row gap-3 items-center">
    <Input v-model="mantissa" class="w-10" />
    <Select v-model="exponent">
      <SelectTrigger>
        <SelectValue placeholder="Select an exponent" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Measures</SelectLabel>
          <SelectItem value="exact"> Second </SelectItem>
          <SelectItem value="m"> MilliSecond </SelectItem>
          <SelectItem value="u"> MicroSecond </SelectItem>
          <SelectItem value="n"> NanoSecond </SelectItem>
          <SelectItem value="p"> PicoSecond </SelectItem>
          <SelectItem value="f"> FemtoSecond </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>
