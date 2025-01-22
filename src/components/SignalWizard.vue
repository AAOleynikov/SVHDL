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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
} from "@/components/ui/pin-input";
import { computed, defineModel } from "vue";
import { ref, watch, reactive } from "vue";
import TimeInput from "./TimeInput.vue";
import { Time } from "@/lib/measureUnits";
import {
  CodeGeneratorData,
  GeneratorStymulus,
  ValueType,
} from "@/testbench_generator/gen";

const props = defineProps<{ modelValue: GeneratorStymulus }>();
const emit = defineEmits(["update:modelValue"]);

const mod: any = props.modelValue;

const hotkey_keyValue = ref<string[]>([""]);
const hotkey_initialValue = ref<ValueType>(mod.initialValue ?? "0");
const const_value = ref<ValueType>(mod.value ?? "0");
const clock_lowValue = ref<ValueType>(mod.low_value ?? "0");
const clock_highValue = ref<ValueType>(mod.high_value ?? "1");
const clock_startsWith = ref<"low_value" | "high_value">(
  mod.starts_with ?? "low_value"
);
const clock_period = ref<Time>(mod.period ?? { exponent: "ns", mantissa: 10 });
const clock_dutyCycle = ref<number>(mod.duty_cycle ?? 50);

const allVars = computed(() => {
  return {
    hotkey_keyValue: hotkey_keyValue.value,
    hotkey_initialValue: hotkey_initialValue.value,
    const_value: const_value.value,
    clock_lowValue: clock_lowValue.value,
    clock_highValue: clock_highValue.value,
    clock_startsWith: clock_startsWith.value,
    clock_period: clock_period.value,
    clock_dutyCycle: clock_dutyCycle.value,
  };
});

watch(allVars, () => {
  if (stymulusType.value === "clock") {
    if (signal_stymulus.value.stimulus_type === "Clock") {
      signal_stymulus.value.duty_cycle = clock_dutyCycle.value;
      signal_stymulus.value.high_value = clock_highValue.value;
      signal_stymulus.value.low_value = clock_lowValue.value;
      signal_stymulus.value.period = clock_period.value;
      signal_stymulus.value.starts_with = clock_startsWith.value;
    } else throw "Error: types unaligned";
  } else if (stymulusType.value === "const") {
    if (signal_stymulus.value.stimulus_type === "Const") {
      signal_stymulus.value.value = const_value.value;
    } else throw "Error: types unaligned";
  } else if (stymulusType.value === "hotkey") {
    if (signal_stymulus.value.stimulus_type === "HotKey") {
      signal_stymulus.value;
    } else throw "Error: types unaligned";
  }
});

const latinKeys = "qwertyuiopasdfghjklzxcvbnm";
const cyrillicKeys = "йцукенгшщзфывапролдячсмить";

const signal_stymulus = ref<GeneratorStymulus>(props.modelValue);

watch(signal_stymulus, (newValue) => {
  emit("update:modelValue", signal_stymulus.value);
});

const description = computed(() => {
  return signal_stymulus.value.stimulus_type;
});

const stymulusType = ref<"clock" | "const" | "hotkey">("clock");
if (signal_stymulus.value.stimulus_type === "Clock")
  stymulusType.value = "clock";
else if (signal_stymulus.value.stimulus_type === "Const")
  stymulusType.value = "const";
else if (signal_stymulus.value.stimulus_type === "HotKey")
  stymulusType.value = "hotkey";

const upperKey = () => {
  const kv = hotkey_keyValue.value[0].toLowerCase();
  if ((cyrillicKeys + latinKeys).indexOf(kv) == -1) {
    hotkey_keyValue.value[0] = "";
    return;
  }
  if (cyrillicKeys.indexOf(kv) != -1) {
    hotkey_keyValue.value[0] =
      latinKeys[cyrillicKeys.indexOf(kv)].toUpperCase();
  } else {
    hotkey_keyValue.value[0] = kv.toUpperCase();
  }
};
watch(stymulusType, (newType, oldType) => {
  if (oldType !== newType) {
    if (newType === "const")
      signal_stymulus.value = {
        stimulus_type: "Const",
        value: const_value.value,
        nameOfTarget: props.modelValue.nameOfTarget,
      };
    else if (newType === "clock") {
      signal_stymulus.value = {
        stimulus_type: "Clock",
        starts_with: clock_startsWith.value,
        high_value: clock_highValue.value,
        low_value: clock_lowValue.value,
        period: clock_period.value,
        duty_cycle: clock_dutyCycle.value,
        nameOfTarget: props.modelValue.nameOfTarget,
      };
    } else if (newType === "hotkey") {
      signal_stymulus.value = {
        stimulus_type: "HotKey",
        time_line: [],
        nameOfTarget: props.modelValue.nameOfTarget,
      };
    }
  }
});
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
            <Select v-model="const_value">
              <SelectTrigger>
                <SelectValue placeholder="Select an exponent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Values</SelectLabel>
                  <SelectItem value="0"> 0 </SelectItem>
                  <SelectItem value="1"> 1 </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        <TabsContent value="clock">
          <div class="flex flex-col gap-3">
            <div><h3>Parameters</h3></div>
            <div class="flex flex-row">
              <Label>Low value</Label
              ><Select v-model="clock_lowValue">
                <SelectTrigger>
                  <SelectValue placeholder="Select an exponent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Values</SelectLabel>
                    <SelectItem value="0"> 0 </SelectItem>
                    <SelectItem value="1"> 1 </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-row">
              <Label>High value</Label
              ><Select v-model="clock_highValue">
                <SelectTrigger>
                  <SelectValue placeholder="Select an exponent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Values</SelectLabel>
                    <SelectItem value="0"> 0 </SelectItem>
                    <SelectItem value="1"> 1 </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-row">
              <Label>Starts with</Label
              ><Select v-model="clock_startsWith">
                <SelectTrigger>
                  <SelectValue placeholder="Select an exponent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Values</SelectLabel>
                    <SelectItem value="low_value"> Low value </SelectItem>
                    <SelectItem value="high_value"> High value </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-row">
              <Label>Period</Label><TimeInput v-model="clock_period" />
            </div>
            <div class="flex flex-row">
              <Label>Duty cycle</Label><Input v-model="clock_dutyCycle" />
              <div>%</div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="hotkey">
          <div class="flex flex-col justify-center items-center gap-5">
            <div class="flex flex-row gap-3 items-center">
              <span> HotKey:</span>
              <PinInput
                id="pin-input"
                v-model="hotkey_keyValue"
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
                <Select v-model="hotkey_initialValue">
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exponent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Values</SelectLabel>
                      <SelectItem value="0"> 0 </SelectItem>
                      <SelectItem value="1"> 1 </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PopoverContent>
  </Popover>
</template>

<style scoped></style>
