/** Промежуточные модели для отображения */

import { Time } from "@/lib/measureUnits";
import { VCDSignal } from "@/features/vcdParser";

export type BitValue = "0" | "1" | "x" | "z";

// Scope - чисто папка vcd
export type WaveFormScope = {
  type: "scope";
  expanded: boolean;
  name: string;
  children: WaveFormData[];
};
// VCD bit - один бит, только 4 возможных значения
export type WaveFormBit = {
  type: "var";
  name: string;
  data: VCDSignal;
};
// Вектор из нескольких битов VCD
export type WaveFormVector = {
  type: "vector";
  expanded: boolean;
  size: number;
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
  leftBorder: number;
  rightBorder: number;
  currentSimTime: number;
  plotsSectionWidth: number;
  mode: "cursor" | "move";
  step: Time;
};
