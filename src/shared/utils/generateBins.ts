
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
