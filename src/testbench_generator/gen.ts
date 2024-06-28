/*******************************************************************
 * VHDL TESTBENCH GENERATOR V0.0.7  							   *
 * 2024.06.11 Oleynikov Anton 	https://github.com/AAOleynikov	   *
 * ****************************************************************/

import { Time } from "@/lib/measureUnits";
import { Stymulus, ValueType } from "./stymulus";

// Тестовый пример конфигурации top-lvl entity и его architectures

export type GeneratorStymulus =
  | GeneratorClockStymulus
  | GeneratorHotkeyStymulus
  | GeneratorConstStymulus;

export interface GeneratorClockStymulus {
  stimulus_type: "Clock";
  low_value: ValueType;
  high_value: ValueType;
  starts_with: "low_value" | "high_value";
  duty_cycle: number;
  period: Time;
}

export interface GeneratorHotkeyStymulus {
  stimulus_type: "HotKey";
  time_line: { time: Time; value: ValueType }[];
}

export interface GeneratorConstStymulus {
  stimulus_type: "Const";
  value: ValueType;
}

export interface GeneratorPort {
  name: string;
  sub_type: "in" | "out" | "inout";
  type: string;
  stimulus: GeneratorStymulus;
}

export interface CodeGeneratorData {
  header_declaration: string;
  entity: {
    name: string;
    ports: GeneratorPort[];
  };
  architectures: {
    name: string;
    of: string;
    signals: any[];
  }[];
  preferred_arch_name: string;
}
const jsonExample: CodeGeneratorData = {
  header_declaration: "library IEEE; use IEEE.STD_LOGIC_1164.all;",
  entity: {
    name: "and3",
    ports: [
      {
        name: "x1",
        sub_type: "in",
        type: "STD_LOGIC",
        stimulus: {
          stimulus_type: "Clock",
          low_value: "0",
          high_value: "1",
          starts_with: "low_value",
          duty_cycle: 50,
          period: { mantissa: 20, exponent: "ns" },
        },
      },
      {
        name: "x2",
        sub_type: "in",
        type: "STD_LOGIC",
        stimulus: {
          stimulus_type: "Clock",
          low_value: "0",
          high_value: "1",
          starts_with: "low_value",
          duty_cycle: 50,
          period: { mantissa: 10, exponent: "ns" },
        },
      },
      {
        name: "x3",
        sub_type: "in",
        type: "STD_LOGIC",
        stimulus: {
          stimulus_type: "HotKey",
          time_line: [
            { time: { mantissa: 0, exponent: "ns" }, value: "0" },
            { time: { mantissa: 40, exponent: "ns" }, value: "1" },
            { time: { mantissa: 60, exponent: "ns" }, value: "1" },
            { time: { mantissa: 80, exponent: "ns" }, value: "0" },
          ],
        },
      },
    ],
  },
  architectures: [
    {
      name: "and3_arch1",
      of: "and3",
      signals: [],
    },
    {
      name: "and3_arch2",
      of: "and3",
      signals: [],
    },
  ],
  preferred_arch_name: "and3_arch1",
};

/*
   По объекту конфигурации top-lvl entity и его architectures конструируется автономный (не зависящий от изменений исходного объекта конфигурации)
   объект класса TestbenchGenerator, содержащий:
   !!		config - поле с данными исходной конфигурации
   !!		vhdl - поле, содержащее тект testbench
   все методы класса являются приватными и используются только в момент конструирования класса для генерации необходимой информации для поля vhdl

   Вложенный приватный класс Stimulus описывает статичные приватные методы создания process для стимулируемых портов (Clock, HotKey)

   Используется в формате AS IT IS
*/

const metaDataForHeader =
  "VHDL TESTBENCH GENERATOR V0.0.7 OLEYNIKOV ANTON https://github.com/AAOleynikov";
/* start TestbenchGenerator declaration */

class TestbenchGenerator {
  config: CodeGeneratorData;
  vhdl: string;
  /* start constructor of TestbenchGenerator */
  constructor(jsonData: CodeGeneratorData) {
    this.config = JSON.parse(JSON.stringify(jsonData));
    this.vhdl = this.createTestBench();
  }
  /* end constructor of TestbenchGenerator */

  private createTestBench(): string {
    let vhdlCode = this.generateHeader();
    vhdlCode += this.generateEntity();
    vhdlCode += this.generateArchitecture();
    vhdlCode += this.generateConfiguration();
    return vhdlCode;
  }

  private generateHeader(): string {
    let TBH = `-- This VHDL TESTBENCH code is generated automatically by\n-- ${metaDataForHeader}\n\n${this.config.header_declaration}\n\n`;
    return TBH;
  }

  private generateEntity(): string {
    let TBE = `entity ${this.config.entity.name}_tb is\nend ${this.config.entity.name}_tb;\n\n`;
    return TBE;
  }

  private generateArchitecture() {
    let TBA = `architecture TB_ARCHITECTURE of ${this.config.entity.name}_tb is\n\n`;
    TBA += `-- Component declaration of the tested unit\n\tcomponent ${this.config.entity.name}\n\t\tport (\n`;
    // Объединение портов
    this.config.entity.ports.forEach((port, index) => {
      TBA += `\t\t\t${port.name} : ${port.sub_type} ${port.type};\n`;
    });
    // Удаление последнего символа ";"
    TBA = TBA.trimEnd();
    TBA = TBA.substring(0, TBA.length - 1) + "\n\t\t);\n\tend component;\n\n";
    // Объявление сигналов для теста
    TBA += "-- Internal signals declarations\n";
    this.config.entity.ports.forEach((port) => {
      TBA += `\tsignal ${port.name} : ${port.type};\n`;
    });

    TBA += "begin\n\n";
    TBA += "-- Unit Under Test port map\n";
    TBA += `\tUUT: ${this.config.entity.name} port map (\n`;

    // Сопоставляем порты с сигналами
    this.config.entity.ports.forEach((port, index) => {
      TBA += `\t\t${port.name} => ${port.name}`;
      TBA +=
        index < this.config.entity.ports.length - 1 ? ",\n" : "\n\t\t);\n\n";
    });

    // Генерация стимулов, если они определены
    this.config.entity.ports.forEach((port) => {
      if (port.stimulus) {
        switch (port.stimulus.stimulus_type) {
          case "Clock":
            TBA += this.Stimulus.generateClock(port);
            break;
          case "HotKey":
            TBA += this.Stimulus.generateHotKey(port);
            break;
          case "Const":
            TBA += this.Stimulus.generateConst(port);
            break;
        }
      }
    });

    TBA += "end TB_ARCHITECTURE;\n\n";
    return TBA;
  }

  private generateConfiguration() {
    let TBC = `configuration TESTBENCH_FOR_${this.config.entity.name} of ${this.config.entity.name}_tb is\n`;
    TBC += "\tfor TB_ARCHITECTURE\n";
    TBC += `\t\tfor UUT : ${this.config.entity.name}\n`;
    TBC += `\t\t\tuse entity work.${this.config.entity.name} (${this.config.preferred_arch_name});\n`;
    TBC += "\t\tend for;\n";
    TBC += "\tend for;\n";
    TBC += `end TESTBENCH_FOR_${this.config.entity.name};`;
    return TBC;
  }

  /* start Stimulus declaration */

  private Stimulus = class {
    static generateClock(port: GeneratorPort) {
      if (port.stimulus.stimulus_type !== "Clock") throw "Wrong stimulus type";
      let SC = `-- Clock stimulus for ${port.name}\n`;
      SC += `\t${port.name}_process: process\n`;
      SC += `\tbegin\n`;
      if (port.stimulus.starts_with == "low_value") {
        SC += `\t\t${port.name} <= '${port.stimulus.low_value}';\n`;
        SC += `\t\twait for ${
          (port.stimulus.period.mantissa * (100 - port.stimulus.duty_cycle)) /
          100
        } ${port.stimulus.period.exponent};\n`;
        SC += `\t\t${port.name} <= '${port.stimulus.high_value}';\n`;
        SC += `\t\twait for ${
          (port.stimulus.period.mantissa * port.stimulus.duty_cycle) / 100
        } ${port.stimulus.period.exponent};\n`;
      } else {
        SC += `\t\t${port.name} <= '${port.stimulus.high_value}';\n`;
        SC += `\t\twait for ${
          (port.stimulus.period.mantissa * port.stimulus.duty_cycle) / 100
        } ${port.stimulus.period.exponent};\n`;
        SC += `\t\t${port.name} <= '${port.stimulus.low_value}';\n`;
        SC += `\t\twait for ${
          (port.stimulus.period.mantissa * (100 - port.stimulus.duty_cycle)) /
          100
        } ${port.stimulus.period.exponent};\n`;
      }
      SC += "\tend process;\n\n";
      return SC;
    }

    static generateHotKey(port: GeneratorPort) {
      if (port.stimulus.stimulus_type !== "HotKey") throw "Wrong stimulus type";
      let cumSumTime = 0;
      let SHK = `-- HotKey stimulus for ${port.name}\n`;
      SHK += `\t${port.name}_process: process\n`;
      SHK += `\tbegin\n`;
      port.stimulus.time_line.forEach((time_line, index) => {
        //опасный момент - если несоблюден порядок по неубыванию времени в записях об изменении time_line, то
        //при вычислении задержки в очередном wait будет получено отрицательное значение и невозмножность отработать

        if (cumSumTime > time_line.time.mantissa) {
          throw new Error("time_line is not ordered by non-decreasing time");
        }

        SHK += `\t\twait for ${time_line.time.mantissa - cumSumTime} ${
          time_line.time.exponent
        };\n`;
        SHK += `\t\t${port.name} <= '${time_line.value}';\n`;
        cumSumTime = time_line.time.mantissa;
      });
      SHK += "\t-- stopping the process forever\n\t\twait;\n";
      SHK += "\tend process;\n\n";
      return SHK;
    }
    static generateConst(port: GeneratorPort) {
      if (port.stimulus.stimulus_type !== "Const") throw "Wrong stimulus type";
      let code = `-- Const stimulus for ${port.name}\n`;
      code += `\t${port.name}_process: process\n`;
      code += `\tbegin\n`;

      code += `\t\t${port.name} <= '${port.stimulus.value}';\n`;
      code += `\t\twait;\n`;
      code += "\t-- stopping the process forever\n\t\twait;\n";
      code += "\tend process;\n\n";
      return code;
    }
  };
}
/* end Stimulus declaration */

/* end TestbenchGenerator declaration */

// const data = JSON.parse(jsonExample);
let TB = new TestbenchGenerator(jsonExample);
console.log(TB.vhdl);
