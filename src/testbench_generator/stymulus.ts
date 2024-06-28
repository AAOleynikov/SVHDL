/* Классы источников сигнала. Для разных источников будут делаться разные процессы в testbench. */
import { Time, timeToFs, toEngineeringNotation } from "@/lib/measureUnits";
import { ParsedVhdlFile, ParsedEntity, ParsedSignal } from "@/lib/parsedFile";

export type ValueType = "0" | "1";

export interface Stymulus {
  generateProcess(): string;
  describe(): string;
}

export function dumpStymulusToString(st: Stymulus): string {
  if (st instanceof ClockStymulus) {
    return JSON.stringify({
      type: "clock",
      period: st.period,
      pulseWidth: st.pulseWidth,
      startPhase: st.phaseShift,
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
    return new ClockStymulus(data.period, data.pulseWidth, data.startPhase);
  } else if (data.type == "const") {
    return new ConstStymulus(data.value);
  } else if (data.type == "hotkey") {
    return new HotkeyStymulus(data.defaultValue, data.key);
  }
}

export class ClockStymulus implements Stymulus {
  period: Time;
  pulseWidth: Time;
  phaseShift: Time;
  constructor(period: Time, pulseWidth: Time, startPhase: Time) {
    this.period = period;
    this.pulseWidth = pulseWidth;
    this.phaseShift = startPhase;
  }
  generateProcess(): string {
    return "-- To Do";
  }
  describe(): string {
    if (
      this.period.mantissa === 0 ||
      timeToFs(this.period) < timeToFs(this.pulseWidth)
    ) {
      return "Clock (invalid)";
    }
    return `Clock (T=${toEngineeringNotation(
      timeToFs(this.period)
    )}s, S=${Math.ceil(
      (timeToFs(this.pulseWidth) / timeToFs(this.period)) * 100
    )}%)`;
  }
}

export class ConstStymulus implements Stymulus {
  value: ValueType;
  constructor(value: ValueType) {
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
  public defaultValue: ValueType;
  public key: string;
  constructor(defaultValue: ValueType, key: string) {
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
