/** В этом файле содержатся функции для работы с единицами измерения */

type TimeExponent = "s" | "ms" | "us" | "ns" | "ps" | "fs";

export class Time {
  mantissa: number;
  exponent: TimeExponent;
  constructor(mantissa: number, exponent: TimeExponent) {
    this.mantissa = mantissa;
    this.exponent = exponent;
  }
  static fromFs(timeFs: number): Time {
    return new Time(timeFs, "fs");
  }
  toFs(): number {
    return timeToFs(this);
  }
  toEngineeringNotation(): string {
    return toEngineeringNotation(this.toFs());
  }
}

function timeToFs(time: Time): number {
  return (
    time.mantissa *
    { s: 1e15, ms: 1e12, us: 1e9, ns: 1e6, ps: 1e3, fs: 1 }[time.exponent]
  );
}

/** Перевести значение в фемто-единицах в инженерную нотацию с точностью до трёх знаков
 * Примеры:
 * 1000 -> 1.00p
 * 1234567 -> 1.23n
 * 123456 -> 123p
 */
function toEngineeringNotation(femtoValue: number): string {
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
