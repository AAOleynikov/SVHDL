/** Событие присвоения сигналу значения в какой-то момент времени */
export class VCDAssignment {
  public timestamp: number;
  public value: string;
  public signal: VCDSignal;
  constructor(timestamp: number, value: string, signal: VCDSignal) {
    this.timestamp = timestamp;
    this.value = value;
    this.signal = signal;
  }
}

class VCDSignal {
  events: VCDAssignment[]; //Список событий, упорядоченный по их временной метке
  name: string;
  identifier: string;
  size: number;
  scope: VCDScope;

  constructor(name: string, identifier: string, size: number, scope: VCDScope) {
    this.name = name;
    this.size = size;
    this.scope = scope;
    this.identifier = identifier;
    this.events = [];
  }

  addEvent(timestamp: number, value: string) {
    this.events.push(new VCDAssignment(timestamp, value, this));
    this.events.sort((a, b) => a.timestamp - b.timestamp);
  }
}

class VCDScope {
  name: string;
  parentScope?: VCDScope;
  signals: VCDSignal[];

  constructor(name: string, parentScope?: VCDScope) {
    this.name = name;
    this.parentScope = parentScope;
    this.signals = [];
  }

  addSignal(signal: VCDSignal) {
    this.signals.push(signal);
  }
}

export class ParsedVCD {
  scopes: VCDScope[];
  timescale: number;
  timescaleUnits: string;
  constructor() {
    this.scopes = [];
  }
  addAssignment(timestamp: number, identifier: string) {}
}

function getDumps(vcd: string): string[] {
  const dumpSection: string = vcd.slice(
    vcd.lastIndexOf("$end") + "$end".length,
    vcd.length
  );
  const regex = /#\d+.*(?:\n(?!#).*)*/;
  const ret: string[] = dumpSection.match(regex);
  return ret;
}

export function parseVCD(vcd: string): ParsedVCD {
  const ret = new ParsedVCD();
  // TODO
  return ret;
}
