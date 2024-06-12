/* Классы источников сигнала. Для разных источников будут делаться разные процессы в testbench. */
import { ParsedVhdlFile, ParsedEntity, ParsedSignal } from "@/lib/parsedFile";
export interface Stymulus {
  signalFor: ParsedSignal;
  generateProcess(): string;
  dumpToJson(): Object;
}

export class ClockStymulus implements Stymulus {
  signalFor: ParsedSignal;
  period: number;
  pulseWidth: number;
  startPhase: number;
  constructor(
    signalFor: ParsedSignal,
    period: number,
    pulseWidth: number,
    startPhase: number
  ) {
    this.signalFor = signalFor;
    this.period = period;
    this.pulseWidth = pulseWidth;
    this.startPhase = startPhase;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  dumpToJson(): Object {
    return {};
  }
}

export class ConstStymulus implements Stymulus {
  signalFor: ParsedSignal;
  value: string;
  constructor(signalFor: ParsedSignal, value: string) {
    this.signalFor = signalFor;
    this.value = value;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  dumpToJson(): Object {
    return {};
  }
}

export class HotkeyStymulus implements Stymulus {
  signalFor: ParsedSignal;
  defaultValue: string;
  constructor(signalFor: ParsedSignal, defaultValue: string) {
    this.signalFor = signalFor;
    this.defaultValue = defaultValue;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  dumpToJson(): Object {
    return {};
  }
}

export class HotkeyAssignment {
  signalFor: ParsedSignal;
  whenFs: number; // Время назначения в фемтосекундах
  what: string; // Значение, которое было присвоено
}
