/* Здесь содержатся классы, хранящие результат парсинга VHDL-файлов
 (c) Oleynikov A. A, 2024
*/

import { ProjectFile } from "./projectSystem";

export type ParsedProjectData = {
  fileName: string;
  entities: { name: string }[];
  architectures: { name: string }[];
}[];

export class ParsedProject {
  vhdlFiles: Map<ProjectFile, ParsedVhdlFile>;
  constructor(data: ParsedProjectData) {}
  toJson(): any {}
}

/* Класс сигнала */
export class ParsedSignal {
  name: string;
  subtype: string;
  type: string;
  constructor(name: string, type: string, subtype: string) {
    this.name = name;
    this.subtype = subtype;
    this.type = type;
  }
}

/* Класс сущности */
export class ParsedEntity {
  name: string;
  ports: any[];
  constructor(name: string) {
    this.name = name;
    this.ports = [];
  }
  appendPort(port_name: string, port_type: string, port_subtype: string) {
    this.ports.push({
      name: port_name,
      type: port_type,
      subtype: port_subtype,
    });
  }
}

/* Класс архитектуры */
export class ParsedArchitecture {
  of_file: ParsedVhdlFile;
  name: string;
  signals: ParsedSignal[];
  constructor(name: string, of: ParsedVhdlFile) {
    this.name = name;
    this.of_file = of;
    this.signals = [];
  }
  appendSignal(signal_name: string, signal_subtype: string) {
    this.signals.push(new ParsedSignal(signal_name, "", signal_subtype));
  }
}

export class ParsedVhdlFile {
  architectures: ParsedArchitecture[];
  header_declaration: string;
  entity: any;

  constructor() {
    this.architectures = [];
    this.header_declaration = "";
  }

  setHeader(header: string): void {
    this.header_declaration += header;
  }

  setEntity(new_entity: any): void {
    this.entity = JSON.parse(JSON.stringify(new_entity));
  }

  appendArchitecture(new_architecture: any): void {
    this.architectures.push(JSON.parse(JSON.stringify(new_architecture)));
  }

  setStimulusClock(
    port_name: string,
    period: number,
    low_value: number,
    high_value: number,
    starts_with: number,
    duty_cycle: number
  ): void {
    var ind = this.entity.ports.findIndex(
      (item: { name: string }) => item.name == port_name
    );
    this.entity.ports[ind].stimulus = {
      stimulus_type: "Clock",
      low_value: low_value,
      high_value: high_value,
      starts_with: starts_with,
      duty_cycle: duty_cycle,
      period: period,
    };
  }
}
