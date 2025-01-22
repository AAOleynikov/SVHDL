/** В этом файле содержатся функции для работы с единицами измерения */

/** Перевести значение в фемто-единицах в инженерную нотацию с точностью до трёх знаков
 * Примеры:
 * 1000 -> 1.00p
 * 1234567 -> 1.23n
 * 123456 -> 123p
 */

export interface Time {
  mantissa: number;
  exponent: "s" | "ms" | "us" | "ns" | "ps" | "fs";
}

export function timeToFs(time: Time): number {
  return (
    time.mantissa *
    { s: 1e15, ms: 1e12, us: 1e9, ns: 1e6, ps: 1e3, fs: 1 }[time.exponent]
  );
}

export function toEngineeringNotation(femtoValue: number): string {
  if (femtoValue === 0) return "0";
  const prefixes = [
    { factor: 1e-15, prefix: "f" },
    { factor: 1e-12, prefix: "p" },
    { factor: 1e-9, prefix: "n" },
    { factor: 1e-6, prefix: "u" },
    { factor: 1e-3, prefix: "m" },
    { factor: 1, prefix: "" },
  ];

  let value = femtoValue * 1e-15; // Convert femto-units to base units
  let selectedPrefix = prefixes[0];

  for (const { factor, prefix } of prefixes) {
    if (value >= factor) {
      selectedPrefix = { factor, prefix };
    } else {
      break;
    }
  }

  value /= selectedPrefix.factor;
  const formattedValue = value.toFixed(2);

  return `${formattedValue}${selectedPrefix.prefix}`;
}

/** Напиши на TypeScript функцию, которая сначала находит в строке определение диапазона
 * с помощью регулярного выражения, потом находит границы диапазона и возвращает
 * все значения, входящие в диапазон.
 * Например: std_logic_vector(3downto0) -> [3,2,1,0]
 * std_logic_vector(0to3) -> [0,1,2,3]
 * */
export function parseRange(str: string): number[] {
  // Регулярное выражение для поиска диапазона
  const rangeRegex = /(\d+)\s*(downto|to)\s*(\d+)/i;
  const match = str.match(rangeRegex);

  if (!match) {
    throw new Error("Диапазон не найден в строке");
  }

  const start = parseInt(match[1], 10);
  const end = parseInt(match[3], 10);
  const direction = match[2].toLowerCase();

  const range: number[] = [];

  if (direction === "downto") {
    for (let i = start; i >= end; i--) {
      range.push(i);
    }
  } else if (direction === "to") {
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
  } else {
    throw new Error("Неверное направление диапазона");
  }

  return range;
}

/** Разработай на TypeScript функцию, которая принимает 3 целых числа:
* Левая граница шкалы - leftBorder
* Правая граница шкалы - rightBorder
* Максимально допустимое количество засечек - maxBins
Функция должна вернуть массив, состоящий не более, чем из maxBins засечек.
Все засечки и величины целые. Засечки не должны быть меньше leftBorder или больше rightBorder.
При самых мелких засечках их значения должны делиться на 1. Если засечек слишком много, их величины должны делиться на2, затем - на 5, затем - на 10, затем - на 20, затем - на 50 и т.д.
Пример решения задачи о нахождении засечек:
leftBorder=12288
rightBorder=16573
maxBins=5
Возьмём шаг 1: получается 4286 засечек, слишком много
Возьмём шаг 2: самая левая засечка - 12288, самая правая - 16572, всего получается 2143 засечки, слишком много
Возьмём шаг 5: самая левая засечка - 12290, самая правая - 16570, всего получается 857 засечек, слишком много
Продолжаем увеличивать шаг до тех пор, пока количество засечек не будет приемлемым, затем возвращаем их список */
export function generateBins(
  leftBorder: number,
  rightBorder: number,
  maxBins: number
): number[] {
  if (rightBorder <= leftBorder) return [];

  const steps = [1, 2, 5];
  let stepIndex = 0;
  let stepMultiplier = 1;
  let step = steps[stepIndex] * stepMultiplier;
  let numBins = Math.floor((rightBorder - leftBorder) / step) + 1;

  while (numBins > maxBins) {
    stepIndex = (stepIndex + 1) % steps.length;
    if (stepIndex === 0) {
      stepMultiplier *= 10;
    }
    step = steps[stepIndex] * stepMultiplier;
    numBins = Math.floor((rightBorder - leftBorder) / step) + 1;
  }

  const bins: number[] = [];
  let currentBin = Math.ceil(leftBorder / step) * step;
  while (currentBin <= rightBorder) {
    bins.push(currentBin);
    currentBin += step;
  }
  return bins;
}
