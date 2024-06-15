/* В этом файле находятся классы персистентных состояний IDE, которые хранятся в LocalStorage и влияют
на результат симуляции (потеря которых будет означать потерю пользовательских данных)  */

import { Stymulus } from "@/testbench_generator/stymulus";
import { ParsedEntity, ParsedVhdlFile } from "./parsedFile";
import { ParsedVCD } from "@/vcd_tools/vcd2json";

/* Настройки пользователя для Stymulus.
Они обновляются, когда:
1) Происходит перекомпиляция
Тогда обновляются список архитектур для каждого файла, конфигурация сигналов для TopLevel-архитектуры и результат парсинга;
2) Пользователь выбирает TopLevel-сущность
Тогда изменяются список доступных входных сигналов для TopLevel-сущности и сбрасывается конфигурация сигналов для TopLevel-сущности;
3) Пользователь задаёт Stymulus для какого-то из входных сигналов
Тогда изменяется конфигурация сигналов для TopLevel-сущности */

export class StymulusConfig {
  project: Project;
  parsingResult: object;
  topLevelFile?: ParsedVhdlFile;
  topLevelEntity?: ParsedEntity;
  inputSignalsConfig: object;
  static loadFromJson(
    projectStorage: ProjectStorage,
    projectName: string,
    data: any
  ): StymulusConfig | undefined {
    const stConfig = new StymulusConfig();
    stConfig.project = projectStorage.getProjectByName(projectName);
    stConfig.parsingResult = new Map();
    stConfig.topLevelFile;
    stConfig.topLevelEntity;
    stConfig.inputSignalsConfig;

    return stConfig;
  }
  static loadFromLocalStorage(
    projectStorage: ProjectStorage,
    projectName: string
  ): StymulusConfig | undefined {
    const rawData = localStorage.getItem(`stymulus_${projectName}`);
    if (rawData == undefined) return;
    const data = JSON.parse(rawData);
    return this.loadFromJson(projectStorage, projectName, data);
  }
}

/** Состояние симуляции */
export class SimulationState {
  waveform: ParsedVCD;
  currentTime: number;
  hotkeyEvents: any[];
  static loadFromLocalStorage(
    projectStorage: ProjectStorage,
    projectName: string
  ): SimulationState | undefined {
    return undefined;
  }
}

/** Хранилище проектов */
export class ProjectStorage {
  projects: Project[] = [];
  activeProject?: Project = undefined;
  unsavedProjects: Project[] = [];
  projectSetUpdated: boolean = false;
  /** Загрузить всё хранилище проектов из LocalStorage */
  static loadFromLocalStorage(): ProjectStorage {
    const newObj = new ProjectStorage();
    const storedProjects = localStorage.getItem("projectLibrary");
    if (storedProjects != undefined) {
      const projectData = JSON.parse(storedProjects);
      newObj.projects = projectData.projects.map(
        (project: string) => new Project(newObj, project)
      );
    }
    return newObj;
  }
  /** Сохранить всё хранилище в LocalStorage */
  saveToLocalStorage() {
    let data: Object = { projects: [] };
    for (let proj of this.projects) data["projects"].push(proj.name);
    localStorage.setItem("projectLibrary", JSON.stringify(data));
    for (let proj of this.projects) proj.saveToLocalStorage();
    this.projectSetUpdated = false;
  }
  /** Записать только изменения */
  saveAll() {
    if (this.projectSetUpdated) {
      let data: Object = { projects: [] };
      for (let proj of this.projects) data["projects"].push(proj.name);
      localStorage.setItem("projectLibrary", JSON.stringify(data));
    }
    for (let proj of this.projects) {
      if (proj.isUnsaved) proj.saveToLocalStorage();
    }
    this.projectSetUpdated = false;
  }
  constructor() {}
  /** Возвращает количество проектов в хранилище */
  count() {
    return this.projects.length;
  }
  newProject(name: string) {
    console.log("Creating new project!!!");
    if (
      !this.projects.some((a: Project) => {
        a.name == name;
      })
    ) {
      // Если проекта с таким именем не существует
      this.projects.push(new Project(this, name));
      this.projects[this.projects.length - 1].isUnsaved = false;
      this.saveToLocalStorage();
    }
    this.projectSetUpdated = true;
  }
  deleteProject(name: string) {
    const proj = this.projects.find((a) => a.name == name);
    if (proj != undefined) {
      // Проект с таким именем существует
      if (this.activeProject == proj) this.activeProject = undefined;
      this.projects = this.projects.filter((a) => a.name != name);
      proj.delete();
    }
    this.projectSetUpdated = true;
  }
  deleteAllProjects() {
    for (let proj of this.projects) proj.delete();
    this.projects = [];
    this.activeProject = undefined;
    this.projectSetUpdated = true;
  }
  renameProject(from: string, to: string) {
    if (!this.projects.some((a) => a.name === to))
      this.projects.find((a) => a.name === from).rename(to);
    this.projectSetUpdated = true;
  }
  getProjectByName(name: string): Project | undefined {
    return this.projects.find((p) => p.name == name);
  }
}

/* Проект */
export class Project {
  storage: ProjectStorage;
  name: string;
  files: ProjectFile[];
  activeFile?: ProjectFile;
  topLevelFile?: ProjectFile;
  topLevelArchitecture?: string;
  isUnsaved: boolean;
  unsavedFiles: ProjectFile[];
  constructor(storage: ProjectStorage, name: string) {
    this.name = name;
    this.storage = storage;
    if (localStorage.getItem(`project_${name}`) != null) {
      const rawProj = localStorage.getItem(`project_${name}`);
      const proj = JSON.parse(rawProj);
      const files: Object[] = proj ?? [];
      this.files = [];
      for (let file of files) {
        this.files.push(new ProjectFile(this, file["name"], file["code"]));
        if (file["isTopLevel"])
          this.topLevelFile = this.files[this.files.length - 1];
      }
      this.isUnsaved = false;
    } else {
      this.files = [];
      this.activeFile = undefined;
      this.isUnsaved = true;
    }
    this.unsavedFiles = [];
  }
  saveToLocalStorage() {
    console.log("saving project to local storage");
    let ser = [];
    for (let file of this.files) {
      file.isUnsaved = false;
      ser.push({
        name: file.name,
        code: file.code,
        isTopLevel: file == this.topLevelFile,
      });
    }
    localStorage.setItem(`project_${this.name}`, JSON.stringify(ser));
    this.isUnsaved = false;
    this.unsavedFiles = [];
  }
  delete() {
    localStorage.removeItem(this.name + "_proj");
  }
  rename(name: string) {
    this.delete();
    this.name = name;
    this.saveToLocalStorage();
    this.unsavedFiles = [];
    this.isUnsaved = false;
  }
  deleteFile(name: string) {
    console.log("delete file", name);
    this.isUnsaved = true;
    const file = this.files.find((a) => a.name == name);
    this.files = this.files.filter((a) => a.name != name);
    this.unsavedFiles = this.unsavedFiles.filter((a) => a.name != name);
    if (this.activeFile == file) this.activeFile = undefined;
  }
  newFile(name: string) {
    this.files.push(new ProjectFile(this, name));
    this.files[this.files.length - 1].isUnsaved = true;
    this.isUnsaved = true;
    this.unsavedFiles.push(this.files[this.files.length - 1]);
  }
  setTopLevelFile(name: string) {
    this.topLevelFile = this.files.find((a) => a.name == name);
  }
  getFileByName(name: string): ProjectFile | undefined {
    return this.files.find((file) => file.name == name);
  }
}
/** Файл проекта */
export class ProjectFile {
  proj: Project;
  code: string;
  name: string;
  isUnsaved: boolean;
  constructor(proj: Project, name: string, code?: string) {
    if (code == undefined)
      this.code =
        " -- Ты можешь писать сюда свой код на vhdl, но не злоупотребляй этим, программа - это программа (:\n";
    else this.code = code;
    this.proj = proj;
    this.name = name;
  }
}
