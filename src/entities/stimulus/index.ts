//TODO разобраться с нарушением FSD
import { Time } from "@/entities/time";
export type ValueType = "0" | "1";

export type GeneratorStymulus =
  | GeneratorClockStymulus
  | GeneratorHotkeyStymulus
  | GeneratorConstStymulus;

export interface GeneratorClockStymulus {
  nameOfTarget: string;
  stimulus_type: "Clock";
  low_value: ValueType;
  high_value: ValueType;
  starts_with: "low_value" | "high_value";
  duty_cycle: number;
  period: Time;
}

export interface GeneratorHotkeyStymulus {
  nameOfTarget: string;
  stimulus_type: "HotKey";
  time_line: { time: Time; value: ValueType }[];
}

export interface GeneratorConstStymulus {
  nameOfTarget: string;
  stimulus_type: "Const";
  value: ValueType;
}
