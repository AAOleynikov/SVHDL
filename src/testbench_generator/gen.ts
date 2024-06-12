/*******************************************************************
 * VHDL TESTBENCH GENERATOR V0.0.4  							   *
 * 2024.05.08 Oleynikov Anton 	https://github.com/AAOleynikov	   *
 * ****************************************************************/

const jsonData = {
  header_declaration: "library IEEE; use IEEE.STD_LOGIC_1164.all;",
  entity: {
    name: "en1",
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
          period: { scalar: 20, type: "ns" },
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
          period: { scalar: 10, type: "ns" },
        },
      },
      {
        name: "y",
        sub_type: "out",
        type: "STD_LOGIC",
      },
    ],
  },
  architectures: [
    {
      name: "en1_arch1",
      of: "en1",
      signals: [],
    },
    {
      name: "en1_arch2",
      of: "en1",
      signals: [],
    },
  ],
  preferred_arch_name: "en1_arch1",
};

/* Сгенерировать тестбенч для UUT-архитектуры. Возвращает string с кодом */
function generateVHDTestbench(jsonData): string {
  // Парсинг JSON данных
  const data = JSON.parse(jsonData);

  let vhdlCode = `-- This VHDL TESTBENCH code is generated automatically v0.0.1\n\n`;

  vhdlCode += `${data.header_declaration}\n\n`;
  vhdlCode += `entity ${data.entity.name}_tb is\nend ${data.entity.name}_tb;\n\n`;

  vhdlCode += `architecture TB_ARCHITECTURE of ${data.entity.name}_tb is\n\n`;
  vhdlCode += `-- Component declaration of the tested unit\n`;
  vhdlCode += `\tcomponent ${data.entity.name}\n\t\tport (\n`;

  // Добавляем порты
  data.entity.ports.forEach((port, index) => {
    const portLine = `\t\t\t${port.name} : ${port.sub_type} ${port.type};\n`;
    vhdlCode += portLine;
  });

  // Удаление последнего символа ";"
  vhdlCode = vhdlCode.trimEnd();
  vhdlCode =
    vhdlCode.substring(0, vhdlCode.length - 1) +
    "\n\t\t);\n\tend component;\n\n";

  // Объявление сигналов для теста
  vhdlCode += "-- Internal signals declarations\n";
  data.entity.ports.forEach((port) => {
    vhdlCode += `\tsignal ${port.name} : ${port.type};\n`;
  });

  vhdlCode += "begin\n\n";
  vhdlCode += "-- Unit Under Test port map\n";
  vhdlCode += `\tUUT: ${data.entity.name} port map (\n`;

  // Сопоставляем порты с сигналами
  data.entity.ports.forEach((port, index) => {
    vhdlCode += `\t\t${port.name} => ${port.name}`;
    vhdlCode += index < data.entity.ports.length - 1 ? ",\n" : "\n\t\t);\n\n";
  });

  // Генерация стимулов, если они определены
  data.entity.ports.forEach((port) => {
    if (port.stimulus && port.stimulus.stimulus_type === "Clock") {
      vhdlCode += `-- Clock stimulus for ${port.name}\n`;
      vhdlCode += `\t${port.name}_process: process\n`;
      vhdlCode += `\tbegin\n`;
      if (port.stimulus.starts_with == "low_value") {
        vhdlCode += `\t\t${port.name} <= '${port.stimulus.low_value}';\n`;
        vhdlCode += `\t\twait for ${
          (port.stimulus.period.scalar * (100 - port.stimulus.duty_cycle)) / 100
        } ${port.stimulus.period.type};\n`;
        vhdlCode += `\t\t${port.name} <= '${port.stimulus.high_value}';\n`;
        vhdlCode += `\t\twait for ${
          (port.stimulus.period.scalar * port.stimulus.duty_cycle) / 100
        } ${port.stimulus.period.type};\n`;
      } else {
        vhdlCode += `\t\t${port.name} <= '${port.stimulus.high_value}';\n`;
        vhdlCode += `\t\twait for ${
          (port.stimulus.period.scalar * port.stimulus.duty_cycle) / 100
        } ${port.stimulus.period.type};\n`;
        vhdlCode += `\t\t${port.name} <= '${port.stimulus.low_value}';\n`;
        vhdlCode += `\t\twait for ${
          (port.stimulus.period.scalar * (100 - port.stimulus.duty_cycle)) / 100
        } ${port.stimulus.period.type};\n`;
      }
      vhdlCode += "\tend process;\n\n";
    }
  });

  vhdlCode += "end TB_ARCHITECTURE;\n\n";

  vhdlCode += `configuration TESTBENCH_FOR_${data.entity.name} of ${data.entity.name}_tb is
\tfor TB_ARCHITECTURE
\t\tfor UUT : ${data.entity.name}
\t\t\tuse entity work.${data.entity.name} (${data.preferred_arch_name});
\t\tend for;
\tend for;
end TESTBENCH_FOR_${data.entity.name};`;
  return vhdlCode;
}

console.log(generateVHDTestbench(jsonData));
