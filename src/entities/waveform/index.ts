/** Промежуточные модели для отображения */
import { VCDSignal } from "@/entities/parsedVcd";
import { Time } from "../time";

export type BitValue = "0" | "1" | "x" | "z";
export type VectorValue = string & { __brand: "VectorValue" };

export const isBitValue = (v: string): v is BitValue => {
  return v === "0" || v === "1" || v === "x" || v === "z";
};
export const isVectorValue = (v: string): v is VectorValue => {
  for (const sym of v) {
    if (!isBitValue(sym)) {
      return false;
    }
  }
  return true;
};

// Scope - чисто папка vcd
export interface WaveFormScope {
  type: "scope";
  expanded: boolean;
  name: string;
  children: WaveFormData[];
}

// VCD bit - один бит, только 4 возможных значения
export type WaveFormBit = {
  type: "var";
  name: string;
  data: VCDSignal;
};

// Вектор из нескольких битов VCD
export type WaveFormVector = {
  type: "vector";
  name: string;
  expanded: boolean;
  children: WaveFormBit[];
};
export type WaveFormData = WaveFormScope | WaveFormBit | WaveFormVector;

/** Модели непосредственно для отображения */
export type DisplayBit = {
  type: "bit";
  data: VCDSignal;
  level: number; // Уровень отступа (вложенность Scope относительно корневого Scope)
  name: string;
  events: { timeFs: number; toValue: BitValue }[];
  hotkey: string | undefined;
  isActive: boolean | undefined;
};
export type DisplayScope = {
  type: "scope";
  data: WaveFormScope;
  level: number; // Уровень отступа (вложенность Scope относительно корневого Scope)
  name: string;
  expanded: boolean;
};
export type DisplayData = DisplayBit | DisplayScope;

export type ScaleData = {
  labelsWidth: number; // Ширина левой части графиков (с обозначениями сигналов)
  leftBorder: Time;
  rightBorder: Time;
  currentSimTime: number;
  plotsSectionWidth: number;
  mode: "cursor" | "move";
  step: Time;
};
