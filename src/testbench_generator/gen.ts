/*******************************************************************
 * VHDL TESTBENCH GENERATOR V0.0.7  							   *
 * 2024.06.11 Oleynikov Anton 	https://github.com/AAOleynikov	   *
 * ****************************************************************/

import { Time } from "@/lib/measureUnits";

export type ValueType = "0" | "1";

var process_id: number = 0;

export type GeneratorStymulus =
  | GeneratorClockStymulus
  | GeneratorHotkeyStymulus
  | GeneratorConstStymulus;

export interface GeneratorClockStymulus {
  nameOfTarget: string;
  stimulus_type: "Clock";
  low_value: ValueType;
  high_value: ValueType;
  starts_with: "low_value" | "high_value";
  duty_cycle: number;
  period: Time;
}

export interface GeneratorHotkeyStymulus {
  nameOfTarget: string;
  stimulus_type: "HotKey";
  time_line: { time: Time; value: ValueType }[];
}

export interface GeneratorConstStymulus {
  nameOfTarget: string;
  stimulus_type: "Const";
  value: ValueType;
}

export interface GeneratorPort {
  name: string;
  sub_type: "in" | "out" | "inout";
  type: string;
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
  stimulus: GeneratorStymulus[];
  preferred_arch_name: string;
}

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

export class TestbenchGenerator {
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
    const TBH = `-- This VHDL TESTBENCH code is generated automatically by\n-- ${metaDataForHeader}\n\n${this.config.header_declaration}\n\n`;
    return TBH;
  }

  private generateEntity(): string {
    const TBE = `entity ${this.config.entity.name}_tb is\nend ${this.config.entity.name}_tb;\n\n`;
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
    this.config.stimulus.forEach((stim) => {
      //TODO избавиться от хардкода
      switch (stim.stimulus_type) {
        case "Clock":
          TBA += this.Stimulus.generateClock(
            {
              name: stim.nameOfTarget,
              sub_type: "in",
              type: "std_logic",
            },
            stim
          );
          break;
        case "HotKey":
          TBA += this.Stimulus.generateHotKey(
            {
              name: stim.nameOfTarget,
              sub_type: "in",
              type: "std_logic",
            },
            stim
          );
          break;
        case "Const":
          TBA += this.Stimulus.generateConst(
            {
              name: stim.nameOfTarget,
              sub_type: "in",
              type: "std_logic",
            },
            stim
          );
          break;
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
    static generateClock(port: GeneratorPort, stim: GeneratorClockStymulus) {
      if (stim.stimulus_type !== "Clock") throw "Wrong stimulus type";
      let SC = `-- Clock stimulus for ${port.name}\n`;
      SC += `\tanton${process_id++}_process: process\n`;
      SC += `\tbegin\n`;
      if (stim.starts_with == "low_value") {
        SC += `\t\t${port.name} <= '${stim.low_value}';\n`;
        SC += `\t\twait for ${
          (stim.period.mantissa * (100 - stim.duty_cycle)) / 100
        } ${stim.period.exponent};\n`;
        SC += `\t\t${port.name} <= '${stim.high_value}';\n`;
        SC += `\t\twait for ${(stim.period.mantissa * stim.duty_cycle) / 100} ${
          stim.period.exponent
        };\n`;
      } else {
        SC += `\t\t${port.name} <= '${stim.high_value}';\n`;
        SC += `\t\twait for ${(stim.period.mantissa * stim.duty_cycle) / 100} ${
          stim.period.exponent
        };\n`;
        SC += `\t\t${port.name} <= '${stim.low_value}';\n`;
        SC += `\t\twait for ${
          (stim.period.mantissa * (100 - stim.duty_cycle)) / 100
        } ${stim.period.exponent};\n`;
      }
      SC += "\tend process;\n\n";
      return SC;
    }

    static generateHotKey(port: GeneratorPort, stim: GeneratorHotkeyStymulus) {
      if (stim.stimulus_type !== "HotKey") throw "Wrong stimulus type";
      let cumSumTime = 0;
      let SHK = `-- HotKey stimulus for ${port.name}\n`;
      SHK += `\tanton${process_id++}_process: process\n`;
      SHK += `\tbegin\n`;
      stim.time_line.forEach((time_line, index) => {
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
    static generateConst(port: GeneratorPort, stim: GeneratorConstStymulus) {
      if (stim.stimulus_type !== "Const") throw "Wrong stimulus type";
      let code = `-- Const stimulus for ${port.name}\n`;
      code += `\tanton${process_id++}_process: process\n`;
      code += `\tbegin\n`;

      code += `\t\t${port.name} <= '${stim.value}';\n`;
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
//let TB = new TestbenchGenerator(jsonExample);
//console.log(TB.vhdl);
