/** Событие присвоения сигналу значения в какой-то момент времени */
class Assignment {
  public timestamp: number;
  public value: string;
  public signal: Signal;
  constructor(timestamp: number, value: string, signal: Signal) {
    this.timestamp = timestamp;
    this.value = value;
    this.signal = signal;
  }
}

class Signal {
  events: Assignment[]; //Список событий, упорядоченный по их временной метке
  name: string;
  identifier: string;
  size: number;
  scope: Scope;

  constructor(name: string, identifier: string, size: number, scope: Scope) {
    this.name = name;
    this.size = size;
    this.scope = scope;
    this.identifier = identifier;
    this.events = [];
  }

  addEvent(timestamp: number, value: string) {
    this.events.push(new Assignment(timestamp, value, this));
    this.events.sort((a, b) => a.timestamp - b.timestamp);
  }
}

class Scope {
  name: string;
  parentScope?: Scope;
  signals: Signal[];

  constructor(name: string, parentScope?: Scope) {
    this.name = name;
    this.parentScope = parentScope;
    this.signals = [];
  }

  addSignal(signal: Signal) {
    this.signals.push(signal);
  }
}

class ParsedVCD {
  scopes: Scope[];
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

function parseVCD(vcd: string): ParsedVCD {
  const ret = new ParsedVCD();

  return ret;
}
