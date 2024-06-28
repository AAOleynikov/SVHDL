/** Событие присвоения сигналу значения в какой-то момент времени */
export class VCDAssignment {
  public timestamp: number;
  public value: "1" | "0" | "u" | "z";
}

export class VCDSignal {
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

  addEvent(timestamp: number, value: "1" | "0" | "u" | "z") {
    this.events.push({ timestamp, value });
    this.events.sort((a, b) => a.timestamp - b.timestamp);
  }
}

export class VCDScope {
  name: string;
  childScopes: VCDScope[] = [];
  signals: VCDSignal[] = [];

  constructor(name: string) {
    this.name = name;
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

function captureTimeScale(input: string): string {
  return input.match(/\$timescale\s*([\s\S]*?)\s*\$end/)[1];
}
function captureScopeSection(input: string): string | null {
  // Регулярное выражение для захвата строк, начинающихся с $scope и заканчивающихся на последнем $upscope $end
  const regex = /(^\$scope[\s\S]*\$upscope\s+\$end)/gm;
  const match = input.match(regex);

  if (match) {
    // Возвращаем первый элемент из найденных совпадений
    return match[0];
  }
  return null;
}
function captureChanges(input: string): string[] {
  // Регулярное выражение для захвата всех частей начиная с '#' в начале строки и до следующего '#' или конца файла
  const regex = /(^#.*(?:\n(?!#).*)*)/gm;
  const matches = input.match(regex);
  return matches || [];
}

export function parseVCD(vcdString: string): ParsedVCD {
  const timeScaleSection = captureTimeScale(vcdString); // TODO разобраться с ней
  const scopeSection = captureScopeSection(vcdString).split("\n");
  const changesSection = captureChanges(vcdString);
  const ret = new ParsedVCD();
  const codes_to_signals: Map<string, VCDSignal> = new Map();
  /** Разбор секции scope */
  const scopeStack: VCDScope[] = [];
  for (const scopeLine of scopeSection) {
    const splittedLine = scopeLine.split(" "); // Линия, разделённая по пробелам
    // $scope module andgate_tb $end
    if (scopeLine.startsWith("$scope")) {
      const scopeName = splittedLine[2];
      const newScope = new VCDScope(scopeName);
      if (scopeStack.length === 0) {
        ret.scopes.push(newScope);
      } else {
        scopeStack[scopeStack.length - 1].childScopes.push(newScope);
      }
      scopeStack.push(newScope);
    }
    // $var reg 1 ! x $end
    else if (scopeLine.startsWith("$var")) {
      const varName = splittedLine[4];
      const varSize = parseInt(splittedLine[2]);
      const varCode = splittedLine[3];
      const newVar = new VCDSignal(
        varName,
        varCode,
        varSize,
        scopeStack[scopeStack.length - 1]
      );
      scopeStack[scopeStack.length - 1].addSignal(newVar);
      codes_to_signals.set(varCode, newVar);
    }
    // $upscope $end
    else {
      scopeStack.pop();
    }
  }
  /** Разбор секции дампов */
  for (const dump of changesSection) {
    const lines = dump.split("\n");
    const time = parseInt(lines[0].slice(1, lines[0].length));
    for (const assig of lines.slice(1, lines.length)) {
      if (assig.startsWith(" ") || assig.length < 2) {
        continue;
      } else if (assig.startsWith("b")) {
        //TODO вектор
        throw "Not Implemented";
      } else {
        const raw_val = assig.charAt(0).toLowerCase();
        if (
          raw_val == "1" ||
          raw_val == "0" ||
          raw_val == "u" ||
          raw_val == "z"
        ) {
          const value: "1" | "0" | "u" | "z" = raw_val;
          const ident: string = assig.slice(1, assig.length);
          codes_to_signals.get(ident).addEvent(time, value);
        } else {
          console.error("Value is: ", raw_val);
          throw "Error in VCD";
        }
      }
    }
  }
  return ret;
}
