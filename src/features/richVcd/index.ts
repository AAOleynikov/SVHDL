/** Структуры данных, оптимизированные для рендера графика */

import { Time } from "@/entities/time";
import { BitValue } from "@/entities/waveform";

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

/** Информация об одной строке графика: о названии переменной, о
 * типе, различные атрибуты и собственно данные для отображения
 */
class PlotData<T, A> {
  attributes: A;
  events: { timestamp: Time; value: T }[];

  // Правая граница графика
  plotLimit: Time;

  // Индексы границ окна, данного на предыдущей итерации
  private prevLeftIndex: number = -1;
  private prevRightIndex: number = -1;

  // Границы окна, данного на предыдущей итерации
  private prevLeftTimeFs: number = -1;
  private prevRightTimeFs: number = -1;

  constructor(data: T[], attributes: A) {
    this.attributes=attributes
    this.events
  }
  /** Получить данные из указанного окна (включает все интервалы
  постоянности, включая те, которые пересекают границы окна) */
  getWindowData(window: Window): Interval<T>[] {
    const windowLeftFs = this.timeToFs(window.leftTime);
    const windowRightFs = this.timeToFs(window.rightTime);
    const intervals: Interval<T>[] = [];

    for (let i = 0; i < this.events.length; i++) {
      const currentEvent = this.events[i];
      const currentTimeFs = this.timeToFs(currentEvent.timestamp);
      const nextEvent = this.events[i + 1];
      const nextTimeFs = nextEvent
        ? this.timeToFs(nextEvent.timestamp)
        : this.timeToFs(this.plotLimit);

      // Define the interval boundaries
      const intervalStartFs = currentTimeFs;
      const intervalEndFs = nextTimeFs;

      // Check if the interval overlaps with the window
      if (intervalEndFs < windowLeftFs || intervalStartFs > windowRightFs) {
        continue; // No overlap
      }

      // Calculate the overlapping portion of the interval with the window
      const overlapStartFs = Math.max(intervalStartFs, windowLeftFs);
      const overlapEndFs = Math.min(intervalEndFs, windowRightFs);

      // Convert femtoseconds back to Time objects
      const leftTime = this.fsToTime(overlapStartFs);
      const rightTime = this.fsToTime(overlapEndFs);

      // Create the interval object
      intervals.push({
        leftTime: leftTime,
        rightTime: rightTime,
        value: currentEvent.value,
        key: i, // Index of the starting event in the events array
      });
    }

    return intervals;
  }
}

export type BitData = PlotData<BitValue>;
export type VectorData = PlotData<string>;
