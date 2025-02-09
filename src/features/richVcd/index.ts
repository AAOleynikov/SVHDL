/** Структуры данных, оптимизированные для рендера графика */

import { GeneratorStymulus } from "@/entities/stimulus";
import { Time, timeToFs } from "@/entities/time";
import { BitValue, VectorValue } from "@/entities/waveform";
import { lowerBound } from "@/shared/utils/binSearch";

export interface Window {
  leftTime: Time;
  rightTime: Time;
}

export interface Interval<T> {
  leftTime: Time;
  rightTime: Time;
  value: T;
  key: number;
}

interface PlotEvent<T> {
  timestampFs: number;
  value: T;
}

/** Информация об одной строке графика: о названии переменной, о
 * типе, различные атрибуты и собственно данные для отображения
 */
abstract class AbstractPlotData<T> {
  events: PlotEvent<T>[] = [];
  intervals: Interval<T>[] = [];

  // Правая граница графика
  plotLimit: Time;

  constructor(plotLimit: Time) {
    this.plotLimit = plotLimit;
  }

  /** Получить данные из указанного окна (включает все интервалы
  постоянности, включая те, которые пересекают границы окна) */
  getWindowData(window: Window): Interval<T>[] {
    const windowLeftFs = timeToFs(window.leftTime);
    const windowRightFs = timeToFs(window.rightTime);

    const leftIdx = Math.max(
      0,
      lowerBound(this.events, windowLeftFs, (a) => a.timestampFs) - 1
    );
    const rightIdx = lowerBound(
      this.events,
      windowRightFs,
      (a) => a.timestampFs
    );

    return this.intervals.slice(leftIdx, rightIdx);
  }
  loadEvents(newEvents: PlotEvent<T>[], newPlotLimit: Time) {
    this.events = newEvents;
    this.plotLimit = newPlotLimit;
    this.intervals = [];
    if (this.events.length == 0) {
      return;
    }
    for (let i = 0; i < this.events.length - 1; i++) {
      this.intervals.push({
        key: i,
        value: this.events[i].value,
        leftTime: { mantissa: this.events[i].timestampFs, exponent: "fs" },
        rightTime: { mantissa: this.events[i + 1].timestampFs, exponent: "fs" },
      });
    }
    const lastEvent = this.events.at(-1) as PlotEvent<T>;
    if (lastEvent.timestampFs < timeToFs(this.plotLimit)) {
      this.intervals.push({
        key: this.events.length - 1,
        value: lastEvent.value,
        leftTime: { mantissa: lastEvent.timestampFs, exponent: "fs" },
        rightTime: this.plotLimit,
      });
    }
  }
}

export class BitPlotData extends AbstractPlotData<BitValue> {
  name: string;
  stimulus: undefined | GeneratorStymulus;
  type = "bit" as const;
  constructor(name: string, plotTime: Time) {
    super(plotTime);
    this.name = name;
  }
}

export class VectorPlotData extends AbstractPlotData<VectorValue> {
  name: string;
  size: number;
  type = "vector" as const;
  expanded: boolean = false;
  constructor(name: string, plotTime: Time) {
    super(plotTime);
  }
}
export interface ScopePlotData {
  type: "scope";
}
export type PlotData = BitPlotData | VectorPlotData | ScopePlotData;

class RichVCD {
  getPlotData(): PlotData[] {
    // TODO
    return [];
  }
}
