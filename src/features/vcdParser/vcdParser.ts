// Подробнее о формате VCD:
// https://en.wikipedia.org/wiki/Value_change_dump - VCD
// https://vc.drom.io/?github=AdoobII/idea_21s/main/vhdl/idea.vcd
// https://github.com/wavedrom/wavedrom
// https://gtkwave.sourceforge.net/ - десктоп приложение для просмотра waveforms
// https://zipcpu.com/blog/2017/07/31/vcd.html

import { StymulusConfig } from "@/lib/ideState";
import { GeneratorStymulus } from "@/features/testbenchGenerator/gen";

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

const sortTimestamp = (scope: VCDScope) => {
  scope.childScopes.map(sortTimestamp);
  scope.signals.forEach((sig) => {
    if (sig instanceof VCDVector) {
      sig.signals.forEach((subsig) => {
        subsig.events.sort((a, b) => a.timestamp - b.timestamp);
      });
    }
    sig.events.sort((a, b) => a.timestamp - b.timestamp);
  });
};

function captureTimeScale(input: string): string {
  const match = input.match(/\$timescale\s*([\s\S]*?)\s*\$end/);
  if (match === null) {
    throw new Error("Error in VCD");
  }
  return match[1];
}
function captureScopeSection(input: string): string {
  // Регулярное выражение для захвата строк, начинающихся с $scope и заканчивающихся на последнем $upscope $end
  const regex = /(^\$scope[\s\S]*\$upscope\s+\$end)/gm;
  const match = input.match(regex);

  if (match) {
    // Возвращаем первый элемент из найденных совпадений
    return match[0];
  }
  throw new Error("Error in VCD");
}
function captureChanges(input: string): string[] {
  // Регулярное выражение для захвата всех частей начиная с '#' в начале строки и до следующего '#' или конца файла
  const regex = /(^#.*(?:\n(?!#).*)*)/gm;
  const matches = input.match(regex);
  return matches || [];
}

export function parseVCD(vcdString: string): VCDScope {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timeScaleSection = captureTimeScale(vcdString); // TODO сделать коррекцию на TimeScale
  const scopeSection = captureScopeSection(vcdString).split("\n");
  const changesSection = captureChanges(vcdString);
  const ret: VCDScope = { childScopes: [], signals: [], name: "" };
  const codes_to_signals: Map<string, VCDSignal> = new Map();
  /** Разбор секции scope */
  const scopeStack: VCDScope[] = [];
  for (const scopeLine of scopeSection) {
    const splittedLine = scopeLine.split(" "); // Линия, разделённая по пробелам
    // $scope module andgate_tb $end
    if (scopeLine.startsWith("$scope")) {
      const scopeName = splittedLine[2];
      const newScope: VCDScope = {
        name: scopeName,
        childScopes: [],
        signals: [],
      };
      if (scopeStack.length === 0) {
        ret.childScopes.push(newScope);
      } else {
        scopeStack[scopeStack.length - 1].childScopes.push(newScope);
      }
      scopeStack.push(newScope);
    }
    // $var reg 1 ! x $end
    else if (scopeLine.startsWith("$var")) {
      const varName = splittedLine[4];
      // const varSize = parseInt(splittedLine[2]);
      const varCode = splittedLine[3];
      const newVar = new VCDSignal(
        varName,
        varCode,
        scopeStack[scopeStack.length - 1]
      );

      scopeStack[scopeStack.length - 1].signals.push(newVar);
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
        const [vectorValue, vectorIdent] = assig.slice(1).split(" ");
        if (vectorValue === undefined || vectorIdent === undefined) {
          throw new Error("Error in VCD");
        }
        codes_to_signals.get(vectorIdent)?.addEvent(time, vectorValue as "0");
        console.warn("Vectors are not well tested yet!");
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
          codes_to_signals.get(ident)?.addEvent(time, value);
        } else {
          console.error("Value is: ", raw_val);
          throw new Error("Error in VCD");
        }
      }
    }
  }
  /** Сортировка всех дампов по временной метке */
  ret.childScopes.forEach((scope) => {
    sortTimestamp(scope);
  });
  return ret;
}

/** Удалить из VCD лишние Scopes, которые были добавлены генератором */
export function enrichParsedVCD(
  initial: VCDScope,
  stimConfig: StymulusConfig
): ParsedVCD {
  let uutScope: VCDScope;
  if (initial.childScopes.find((a) => a.name === "uut") !== undefined) {
    uutScope = initial;
  } else {
    const tlScope = initial.childScopes.find((scope) =>
      scope.name.endsWith("_tb")
    );
    if (tlScope === undefined) {
      throw new Error("Troubles with scopes");
    }
    uutScope = tlScope;
  }

  const newScope = uutScope.childScopes.find((scope) => scope.name === "uut");
  if (newScope === undefined) {
    console.log("Scope: ", initial);
    throw new Error("Troubles with scopes");
  }
  uutScope = newScope;

  const inputSignals: { var: VCDVariable; stimulus: GeneratorStymulus }[] = [];
  const outputSignals: VCDVariable[] = [];

  uutScope.signals.forEach((variable) => {
    console.log("Real stim config: ", stimConfig);
    const stim = stimConfig.stymulusList.get(variable.name);
    if (stim !== undefined) {
      inputSignals.push({ var: variable, stimulus: stim });
    } else {
      outputSignals.push(variable);
    }
  });

  return {
    scopes: uutScope.childScopes,
    inputSignals,
    outputSignals,
  };
}
