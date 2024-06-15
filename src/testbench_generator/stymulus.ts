/* Классы источников сигнала. Для разных источников будут делаться разные процессы в testbench. */
import { ParsedVhdlFile, ParsedEntity, ParsedSignal } from "@/lib/parsedFile";
export interface Stymulus {
  signalFor: ParsedSignal;
  generateProcess(): string;
}

export function dumpStymulusToString(st: Stymulus): string {
  if (st instanceof ClockStymulus) {
    return JSON.stringify({
      type: "clock",
      period: st.period,
      pulseWidth: st.pulseWidth,
      startPhase: st.startPhase,
    });
  } else if (st instanceof ConstStymulus) {
    return JSON.stringify({
      type: "const",
      value: st.value,
    });
  } else if (st instanceof HotkeyStymulus) {
    return JSON.stringify({
      type: "hotkey",
      defaultValue: st.defaultValue,
      key: st.key,
    });
  }
  throw "Invalid stymulus dump";
}

export function loadStymulusFromString(
  str: string,
  signalFor: ParsedSignal
): Stymulus {
  const data = JSON.parse(str);
  if (data.type == "clock") {
    return new ClockStymulus(
      signalFor,
      data.period,
      data.pulseWidth,
      data.startPhase
    );
  } else if (data.type == "const") {
    return new ConstStymulus(signalFor, data.value);
  } else if (data.type == "hotkey") {
    return new HotkeyStymulus(signalFor, data.defaultValue, data.key);
  }
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
}

export class HotkeyStymulus implements Stymulus {
  signalFor: ParsedSignal;
  defaultValue: string;
  key: string;
  constructor(signalFor: ParsedSignal, defaultValue: string, key: string) {
    this.signalFor = signalFor;
    this.defaultValue = defaultValue;
    this.key = key;
  }
  generateProcess(): string {
    return "-- To Do";
  }
}

export class HotkeyAssignment {
  signalFor: ParsedSignal;
  whenFs: number; // Время назначения в фемтосекундах
  what: string; // Значение, которое было присвоено
}
