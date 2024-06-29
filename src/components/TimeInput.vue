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
import { computed, ref, watch } from "vue";
import { Time, timeToFs } from "@/lib/measureUnits";

const value = defineModel<Time>({ required: true });

const stringMantissa = ref<string>(value.value.mantissa.toString());

watch(stringMantissa, () => {
  if (isValid.value) {
    value.value.mantissa = parseFloat(stringMantissa.value.replace(",", "."));
  }
});

watch(
  value,
  (newValue, oldValue) => {
    if (newValue.mantissa !== oldValue.mantissa) {
      stringMantissa.value = newValue.mantissa.toString();
    }
  },
  { deep: true }
);

const isValid = computed<boolean>(() => {
  const rawMantissa = stringMantissa.value.replace(",", ".");
  const floatRegex = /^(\d+\.?\d*|\.?\d+)$/;
  if (!floatRegex.test(rawMantissa)) {
    return false;
  }
  const mantissa = parseFloat(rawMantissa);
  const femtos = timeToFs({ mantissa, exponent: value.value.exponent });
  if (femtos - Math.floor(femtos) > 0) return false;
  return true;
});
</script>

<template>
  <div
    class="flex flex-row gap-3 items-center border-2 shadow-sm hover:shadow-md rounded-md"
    :class="{ 'border-slate-200': isValid, 'border-red-600': !isValid }">
    <div class="min-w-20 max-w-20">
      <input
        style="all: unset"
        class="w-full max-w-full"
        v-model="stringMantissa" />
    </div>
    <div class="max-w-15">
      <Select v-model="value.exponent">
        <SelectTrigger>
          <SelectValue placeholder="Select an exponent" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Measures</SelectLabel>
            <SelectItem value="s"> s </SelectItem>
            <SelectItem value="ms"> ms </SelectItem>
            <SelectItem value="us"> us </SelectItem>
            <SelectItem value="ns"> ns </SelectItem>
            <SelectItem value="ps"> ps </SelectItem>
            <SelectItem value="fs"> fs </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
