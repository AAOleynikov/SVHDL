export type InputValueType = "0" | "1";
export type ValueType = "0" | "1" | "u" | "z";

export interface Time {
  mantissa: number;
  exponent: "s" | "ms" | "us" | "ns" | "ps" | "fs";
}