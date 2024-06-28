<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
} from "@/components/ui/pin-input";
import { computed, defineModel } from "vue";
import { IDEState } from "@/lib/ideState";
import {
  Stymulus,
  ClockStymulus,
  ConstStymulus,
  HotkeyStymulus,
} from "@/testbench_generator/stymulus";
import { ref, watch } from "vue";
import TimeInput from "./TimeInput.vue";

const keyValue = ref<string[]>([""]);
const period = ref<number>(1000000);

const latinKeys = "qwertyuiopasdfghjklzxcvbnm";
const cyrillicKeys = "йцукенгшщзфывапролдячсмить";

const signal_stymulus = defineModel<Stymulus>();

const description = computed(() => {
  return signal_stymulus.value.describe();
});

const stymulusType = ref<"clock" | "const" | "hotkey">("clock");
if (signal_stymulus.value instanceof ClockStymulus)
  stymulusType.value = "clock";
else if (signal_stymulus.value instanceof ConstStymulus)
  stymulusType.value = "const";
else if (signal_stymulus.value instanceof HotkeyStymulus)
  stymulusType.value = "hotkey";

const upperKey = () => {
  const kv = keyValue.value[0].toLowerCase();
  if ((cyrillicKeys + latinKeys).indexOf(kv) == -1) {
    keyValue.value[0] = "";
    return;
  }
  if (cyrillicKeys.indexOf(kv) != -1) {
    keyValue.value[0] = latinKeys[cyrillicKeys.indexOf(kv)].toUpperCase();
  } else {
    keyValue.value[0] = kv.toUpperCase();
  }
};
watch(stymulusType, (newType, oldType) => {
  if (oldType !== newType) {
    if (newType === "const") signal_stymulus.value = new ConstStymulus("0");
    else if (newType === "clock") {
      signal_stymulus.value = new ClockStymulus(
        { mantissa: 10, exponent: "ns" },
        { mantissa: 5, exponent: "ns" },
        { mantissa: 1, exponent: "ns" }
      );
    } else if (newType === "hotkey") {
      signal_stymulus.value = new HotkeyStymulus("0", "a");
      signal_stymulus.value;
    }
  }
});

watch(
  signal_stymulus,
  () => {
    console.log("Signal stymulus updated");
  },
  { deep: true }
);
</script>

<template>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">{{ description }}</Button>
    </PopoverTrigger>
    <PopoverContent className="w-96">
      <Tabs v-model="stymulusType">
        <TabsList>
          <TabsTrigger value="const"> Const </TabsTrigger>
          <TabsTrigger value="clock"> Clock </TabsTrigger>
          <TabsTrigger value="hotkey"> HotKey </TabsTrigger>
        </TabsList>
        <TabsContent value="const">
          <div class="flex flex-row gap-3 items-center mt-3">
            <Label>0</Label>
            <Switch />
            <Label>1</Label>
          </div>
        </TabsContent>
        <TabsContent value="clock">
          <div class="flex flex-col gap-3">
            <div><h3>Parameters</h3></div>
            <div class="flex flex-row"><Label>Low value</Label></div>
          </div>
        </TabsContent>
        <TabsContent value="hotkey">
          <div class="flex flex-col justify-center items-center gap-5">
            <div class="flex flex-row gap-3 items-center">
              <span> HotKey:</span>
              <PinInput
                id="pin-input"
                v-model="keyValue"
                placeholder="○"
                @complete="upperKey">
                <PinInputGroup>
                  <PinInputInput :index="0" />
                </PinInputGroup>
              </PinInput>
            </div>
            <div class="flex flex-row gap-3 items-center">
              <span>Value at start:</span>
              <div class="flex flex-row gap-3 items-center">
                <Label>0</Label>
                <Switch />
                <Label>1</Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PopoverContent>
  </Popover>
</template>

<style scoped></style>
