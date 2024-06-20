/* Классы источников сигнала. Для разных источников будут делаться разные процессы в testbench. */
import { ParsedVhdlFile, ParsedEntity, ParsedSignal } from "@/lib/parsedFile";
export interface Stymulus {
  generateProcess(): string;
  describe(): string;
}

export function dumpStymulusToString(st: Stymulus): string {
  if (st instanceof ClockStymulus) {
    return JSON.stringify({
      type: "clock",
      period: st.periodFs,
      pulseWidth: st.pulseWidthFs,
      startPhase: st.phaseShiftFs,
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
  periodFs: number;
  pulseWidthFs: number;
  phaseShiftFs: number;
  constructor(period: number, pulseWidth: number, startPhase: number) {
    this.periodFs = period;
    this.pulseWidthFs = pulseWidth;
    this.phaseShiftFs = startPhase;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  describe(): string {
    return `Clock (T=${toEngineeringNotation(this.periodFs)}s, S=${Math.ceil(
      (this.pulseWidthFs / this.periodFs) * 100
    )}%)`;
  }
}

export class ConstStymulus implements Stymulus {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  describe(): string {
    return "Constant " + this.value;
  }
}

export class HotkeyStymulus implements Stymulus {
  defaultValue: string;
  key: string;
  constructor(defaultValue: string, key: string) {
    this.defaultValue = defaultValue;
    this.key = key;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  describe(): string {
    return `Hotkey "${this.key}" from value ${this.defaultValue}`;
  }
}

export class HotkeyAssignment {
  signalFor: ParsedSignal;
  whenFs: number; // Время назначения в фемтосекундах
  what: string; // Значение, которое было присвоено
}
