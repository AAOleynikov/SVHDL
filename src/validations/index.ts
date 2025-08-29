import { ValueType } from "@/types/common";

export const isValueType = (a: string): a is ValueType =>
  ["1", "0", "u", "z"].includes(a);
