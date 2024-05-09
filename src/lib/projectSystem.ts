export class ProjectStorage {
  projects: Project[];
  activeProject?: Project;
  unsavedProjects: Project[];
  saveToLocalStorage() {}
  addProject(name: string) {}
  loadAll() {
    this.projects=[]
    const storedProjects = localStorage.getItem("projectLibrary");
    if (storedProjects != undefined) {
      const projectData = JSON.parse(storedProjects);
      this.projects = projectData.projects.map(
        (project: string) => new Project(this, project)
      );

      if (projectData.activeProject != undefined) {
        this.activeProject = this.projects.find(
          (nm) => nm === projectData.activeProject
        );
      }
      this.unsavedProjects = [];
    }
  }
  saveAll() {}
  constructor() {
    this.loadAll();
  }
}
export class Project {
  storage: ProjectStorage;
  name: string;
  files: ProjectFile[];
  activeFile?: ProjectFile;
  isUnsaved: boolean;
  unsavedFiles: [];
  constructor(storage: ProjectStorage, name: string) {
    this.name = name;
    this.storage = storage;
    if (localStorage.getItem(`${name}_proj`) != null) {
      const rawProj = localStorage.getItem(`${name}_proj`);
      const proj = JSON.parse(rawProj);
      const files: Object[] = proj["files"];
      this.files = [];
      for (let file of files) {
        this.files.push(new ProjectFile(this, file["name"], file["code"]));
      }
      this.isUnsaved = false;
    } else {
      this.files = [new ProjectFile(this, "main.vhd")];
      this.activeFile = this.files[0];
      this.isUnsaved = true;
    }
  }
  saveToLocalStorage() {
    let ser = [];
    for (let file of this.files) {
      ser.push({ name: file.name, code: file.code });
    }
    localStorage.setItem(`${this.name}_proj`, JSON.stringify(ser));
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
