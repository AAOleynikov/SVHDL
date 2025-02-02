/* В этом файле находятся классы персистентных состояний IDE, которые хранятся в LocalStorage и влияют
на результат симуляции (потеря которых будет означать потерю пользовательских данных)  */

/** Хранилище проектов */
export class ProjectStorage {
  projects: Project[] = [];
  projectSetUpdated: boolean = false;
  hasUnsavedChanges: boolean = false;
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
    const data: any = { projects: [] };
    for (const proj of this.projects) data.projects.push(proj.name);
    localStorage.setItem("projectLibrary", JSON.stringify(data));
    for (const proj of this.projects) proj.saveToLocalStorage();
    this.projectSetUpdated = false;
  }
  /** Записать только изменения */
  saveAll(): boolean {
    let ret = false;
    if (this.projectSetUpdated) {
      ret = true;
      const data: any = { projects: [] };
      for (const proj of this.projects) data.projects.push(proj.name);
      localStorage.setItem("projectLibrary", JSON.stringify(data));
    }
    for (const proj of this.projects) {
      if (proj.isUnsaved) {
        proj.saveToLocalStorage();
        ret = true;
      }
    }
    this.projectSetUpdated = false;
    this.hasUnsavedChanges = false;
    return ret;
  }
  constructor() {}
  /** Возвращает количество проектов в хранилище */
  count() {
    return this.projects.length;
  }
  newProject(name: string) {
    if (
      !this.projects.some((a: Project) => {
        return a.name === name;
      })
    ) {
      // Если проекта с таким именем не существует
      this.projects.push(new Project(this, name));
      this.projects[this.projects.length - 1].isUnsaved = false;
      this.saveToLocalStorage();
      this.projectSetUpdated = true;
      this.hasUnsavedChanges = true;
    }
  }
  deleteProject(name: string) {
    const proj = this.projects.find((a) => a.name == name);
    if (proj != undefined) {
      // Проект с таким именем существует
      this.projects = this.projects.filter((a) => a.name != name);
      localStorage.removeItem("project_" + name);
      this.projectSetUpdated = true;
      this.hasUnsavedChanges = true;
    }
  }
  deleteAllProjects() {
    for (const proj of this.projects) this.deleteProject(proj.name);
    this.projects = [];
    this.projectSetUpdated = true;
    this.hasUnsavedChanges = true;
  }
  renameProject(from: string, to: string): boolean {
    if (!this.projects.some((a) => a.name === to)) {
      this.projects.find((a) => a.name === from)?.rename(to);
      this.projectSetUpdated = true;
      this.hasUnsavedChanges = true;
      return true;
    } else return false;
  }
  getProjectByName(name: string): Project | undefined {
    return this.projects.find((p) => p.name == name);
  }
}

/* Проект */
export class Project {
  setUnsaved() {
    this.isUnsaved = true;
    this.storage.hasUnsavedChanges = true;
  }
  storage: ProjectStorage;
  name: string;
  files: ProjectFile[];
  activeFile?: ProjectFile;
  isUnsaved: boolean;
  constructor(storage: ProjectStorage, name: string) {
    this.name = name;
    this.storage = storage;
    if (localStorage.getItem(`project_${name}`) != null) {
      const rawProj = localStorage.getItem(`project_${name}`) as string;
      const proj = JSON.parse(rawProj);
      const files: any[] = proj ?? [];
      this.files = [];
      files.forEach((file) => {
        this.files.push(new ProjectFile(this, file.name, file.code));
      });
      this.isUnsaved = false;
    } else {
      this.files = [];
      this.activeFile = undefined;
      this.isUnsaved = true;
    }
  }
  saveToLocalStorage() {
    const ser: any[] = [];
    this.files.forEach((file) => {
      file.isUnsaved = false;
      ser.push({
        name: file.name,
        code: file.code,
      });
    });
    localStorage.setItem(`project_${this.name}`, JSON.stringify(ser));
    this.isUnsaved = false;
  }
  rename(name: string) {
    localStorage.removeItem("project_" + this.name);
    this.name = name;
    this.saveToLocalStorage();
  }
  renameFile(from: string, to: string): boolean {
    const file = this.files.find((a) => a.name == from);
    if (file === undefined) {
      return false;
    }
    if (!this.files.some((a) => a.name == to)) {
      file.name = to;
      file.setUnsaved();
      return true;
    }
    return false;
  }
  deleteFile(name: string) {
    console.log("delete file", name);
    this.isUnsaved = true;
    const file = this.files.find((a) => a.name == name);
    this.files = this.files.filter((a) => a.name != name);
    if (this.activeFile == file) this.activeFile = undefined;
    this.storage.hasUnsavedChanges = true;
  }
  newFile(name: string) {
    this.files.push(new ProjectFile(this, name));
    this.files[this.files.length - 1].setUnsaved();
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
  isUnsaved: boolean = false;
  isExpanded: boolean = false; // Развёрнут ли файл в дереве (видны ли сущности в нём)

  constructor(proj: Project, name: string, code?: string) {
    if (code == undefined)
      this.code =
        " -- You can write your code here, but dont forget: program is program (-:\n";
    else this.code = code;
    this.proj = proj;
    this.name = name;
  }
  setUnsaved() {
    this.isUnsaved = true;
    this.proj.setUnsaved();
  }
}
