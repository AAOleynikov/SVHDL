/* Здесь содержатся классы, хранящие результат парсинга VHDL-файлов
 (c) Oleynikov A. A, 2024
*/

import { ProjectFile } from "@/lib/projectSystem";

export type ParsedProjectJson = ParsedFileJson[];

export type ParsedFileJson = {
  fileName: string;
  headerDeclaration: string;
  entities: ParsedEntityJson[];
  architectures: ParsedArchitectureJson[];
};

export type ParsedArchitectureJson = {
  name: string;
  nameOfEntity: string;
  signals: {
    name: string;
    type: string;
  }[];
};

export type ParsedEntityJson = {
  name: string;
  ports: ParsedPortJson[];
};

type ParsedPortJson = {
  name: string;
  type: string;
  mode: "in" | "out" | "inout";
};

export class ParsedProject {
  vhdlFiles: ParsedVhdlFile[] = [];
  constructor(data: ParsedProjectJson = []) {
    for (let rawFile of data) {
      this.addFile(new ParsedVhdlFile(rawFile));
    }
  }
  addFile(file: ParsedVhdlFile) {
    this.vhdlFiles.push(file);
  }
  toJson(): ParsedProjectJson {
    const data: ParsedProjectJson = [];
    for (let file of this.vhdlFiles) {
      data.push(file.toJson());
    }
    return data;
  }
}

/** Класс сигнала */
export class ParsedSignal {
  name: string;
  type: string;
  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }
}

/** Класс сущности */
export class ParsedEntity {
  name: string;
  fileName: string;
  ports: ParsedPortJson[] = [];
  constructor(name: string, fileName: string) {
    this.name = name;
    this.fileName=fileName
  }
  appendPort(
    port_name: string,
    port_type: string,
    mode: "in" | "out" | "inout"
  ) {
    this.ports.push({
      name: port_name,
      type: port_type,
      mode,
    });
  }
  toJson(): ParsedEntityJson {
    const data: ParsedEntityJson = {
      name: this.name,
      ports: this.ports.map((port) => {
        return { name: port.name, type: port.type, mode: port.mode };
      }),
    };
    return data;
  }
}

/** Класс архитектуры */
export class ParsedArchitecture {
  of_entity: string;
  name: string;
  signals: ParsedSignal[];
  constructor(name: string, of_entity: string) {
    this.name = name;
    this.of_entity = of_entity;
    this.signals = [];
  }
  appendSignal(signal_name: string, signal_type: string) {
    this.signals.push(new ParsedSignal(signal_name, signal_type));
  }
  toJson(): ParsedArchitectureJson {
    const ret: ParsedArchitectureJson = {
      name: this.name,
      nameOfEntity: this.of_entity,
      signals: this.signals.map((a) => {
        return { name: a.name, type: a.type };
      }),
    };
    return ret;
  }
}

export class ParsedVhdlFile {
  architectures: ParsedArchitecture[] = [];
  header_declaration: string = ""; // Заголовок файла
  entities: ParsedEntity[] = [];
  fileName: string;

  /** @param data - имя файла (тогда создастся пустая запись) или object, соответствующий ParsedFileJson */
  constructor(data: string | ParsedFileJson) {
    if (typeof data === "string") {
      this.fileName = data;
    } else {
      this.fileName = data.fileName;
      this.header_declaration = data.headerDeclaration;
      for (let entity of data.entities) {
        const newEntity = new ParsedEntity(entity.name, this.fileName);
        for (let port of entity.ports) {
          newEntity.appendPort(port.name, port.type, port.mode);
        }
        this.addEntity(newEntity);
      }
      for (let arch of data.architectures) {
        const newArch = new ParsedArchitecture(arch.name, arch.nameOfEntity);
        for (let signal of arch.signals) {
          newArch.appendSignal(signal.name, signal.type);
        }
        this.appendArchitecture(newArch);
      }
    }
  }

  setHeader(header: string): void {
    this.header_declaration += header;
  }

  addEntity(newEntity: ParsedEntity): void {
    this.entities.push(newEntity);
  }

  appendArchitecture(new_architecture: ParsedArchitecture): void {
    this.architectures.push(new_architecture);
  }

  toJson(): ParsedFileJson {
    const data: ParsedFileJson = {
      fileName: this.fileName,
      headerDeclaration: this.header_declaration,
      entities: this.entities.map((a) => {
        return a.toJson();
      }),
      architectures: this.architectures.map((a) => {
        return a.toJson();
      }),
    };
    return data;
  }
}
