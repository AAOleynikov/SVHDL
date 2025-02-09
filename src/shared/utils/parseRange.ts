/** Функция, которая сначала находит в строке определение диапазона
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
