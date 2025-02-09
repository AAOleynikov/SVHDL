import { GeneratorStymulus } from "../stimulus";
import { BitValue, VectorValue } from "../waveform";

interface VCDAssignment<T> {
  timestampFs: number;
  value: T;
}

export type VCDSignalAssignment = VCDAssignment<BitValue>;
export type VCDVectorAssignment = VCDAssignment<VectorValue>;

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

  addEvent(timestampFs: number, value: BitValue) {
    this.events.push({ timestampFs, value });
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

  addEvent(timestampFs: number, value: VectorValue) {
    this.events.push({ timestampFs, value });
    this.signals.forEach((signal, idx) => {
      signal.addEvent(timestampFs, value[idx] as BitValue);
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
