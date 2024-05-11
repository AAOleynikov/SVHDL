export class ProjectStorage {
  projects: Project[];
  activeProject?: Project;
  unsavedProjects: Project[];
  saveToLocalStorage() {}
  // Загрузить всё хранилище проектов из LocalStorage
  loadAll() {
    this.projects = [];
    const storedProjects = localStorage.getItem("projectLibrary");
    if (storedProjects != undefined) {
      const projectData = JSON.parse(storedProjects);
      this.projects = projectData.projects.map(
        (project: string) => new Project(this, project)
      );

      if (projectData.activeProject != undefined) {
        this.activeProject = this.projects.find(
          (nm) => nm.name === projectData.activeProject
        );
      }
      this.unsavedProjects = [];
    }
  }
  // Сохранить всё хранилище в LocalStorage
  saveAll() {
    let data: Object = { projects: [] };
    if (this.activeProject) data["activeProject"] = this.activeProject.name;
    for (let proj of this.projects) {
      data["projects"].push(proj.name);
    }
    localStorage.setItem("projectLibrary", JSON.stringify(data));

    for (let proj of this.projects) {
      if (proj.isUnsaved) proj.saveToLocalStorage();
    }
  }
  constructor() {
    this.loadAll();
  }
  // Возвращает количество проектов в хранилище
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
      this.saveAll();
    }
  }
  deleteProject(name: string) {
    const proj = this.projects.find((a) => a.name == name);
    if (proj != undefined) {
      // Проект с таким именем существует
      if (this.activeProject == proj) this.activeProject = undefined;
      this.projects = this.projects.filter((a) => a.name != name);
      proj.delete();
    }
  }
  deleteAllProjects() {
    for (let proj of this.projects) proj.delete();
    this.projects = [];
    this.activeProject = undefined;
  }
  renameProject(from: string, to: string) {
    if (!this.projects.some((a) => a.name === to))
      this.projects.find((a) => a.name === from).rename(to);
  }
  setProjectActive(name: string) {
    this.activeProject = this.projects.find((a) => a.name == name);
  }
}
export class Project {
  storage: ProjectStorage;
  name: string;
  files: ProjectFile[];
  activeFile?: ProjectFile;
  topLevelFile?: ProjectFile;
  isUnsaved: boolean;
  unsavedFiles: ProjectFile[];
  constructor(storage: ProjectStorage, name: string) {
    this.name = name;
    this.storage = storage;
    if (localStorage.getItem(`${name}_proj`) != null) {
      const rawProj = localStorage.getItem(`${name}_proj`);
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
    localStorage.setItem(this.name + "_proj", JSON.stringify(ser));
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
  setActiveFile(name: string) {
    this.activeFile = this.files.find((a) => a.name == name);
  }
}
class ProjectFile {
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
