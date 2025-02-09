/**
 * Найти первый индекс в отсортированном массиве, где ключ не меньше target
 */
export function lowerBound<T, S>(
  array: T[],
  target: S,
  keyFunc: (arg: T) => S
) {
  let left = 0;
  let right = array.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (keyFunc(array[mid]) < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}
