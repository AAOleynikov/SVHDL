import { GeneratorStymulus } from "../stimulus";

/** Событие присвоения сигналу значения в какой-то момент времени */
export interface VCDSignalAssignment {
  timestamp: number;
  value: "1" | "0" | "u" | "z";
}

export interface VCDVectorAssignment {
  timestamp: number;
  value: string;
}

export class VCDSignal {
  type = "bit" as const;
  events: VCDSignalAssignment[]; //Список событий, упорядоченный по их временной метке
  name: string;
  identifier: string;
  scope: VCDScope;

  constructor(name: string, identifier: string, scope: VCDScope) {
    this.name = name;
    this.scope = scope;
    this.identifier = identifier;
    this.events = [];
  }

  addEvent(timestamp: number, value: "1" | "0" | "u" | "z") {
    this.events.push({ timestamp, value });
  }
}

export class VCDVector {
  type = "vector" as const;
  events: VCDVectorAssignment[]; //Список событий, упорядоченный по их временной метке
  name: string;
  identifier: string;
  size: number;
  scope: VCDScope;
  signals: VCDSignal[];

  constructor(name: string, identifier: string, size: number, scope: VCDScope) {
    this.name = name;
    this.size = size;
    this.scope = scope;
    this.identifier = identifier;
    this.events = [];
    this.signals = Array.from(Array(size).keys()).map((key) => {
      return new VCDSignal(`${name}[${key}]`, "", scope);
    });
  }

  addEvent(timestamp: number, value: string) {
    this.events.push({ timestamp, value });
    this.signals.forEach((signal, idx) => {
      signal.addEvent(timestamp, value[idx] as "1" | "0" | "z" | "u");
    });
  }
}

export type VCDVariable = VCDSignal | VCDVector;

export interface VCDScope {
  name: string;
  childScopes: VCDScope[];
  signals: VCDVariable[];
}

export interface ParsedVCD {
  scopes: VCDScope[];
  inputSignals: { var: VCDVariable; stimulus: GeneratorStymulus }[];
  outputSignals: VCDVariable[];
}
