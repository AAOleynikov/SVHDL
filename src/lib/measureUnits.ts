/** В этом файле содержатся функции для работы с единицами измерения */

/** Перевести значение в фемто-единицах в инженерную нотацию с точностью до трёх знаков
 * Примеры:
 * 1000 -> 1.00p
 * 1234567 -> 1.23n
 * 123456 -> 123p
 */
export function toEngineeringNotation(femtoValue: number): string {
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
