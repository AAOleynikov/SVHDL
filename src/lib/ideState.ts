import { ProjectStorage, Project, ProjectFile } from "./projectSystem";

class StymulusState {
  saveToLocalStorage() {
    // Логика сохранения StymulusState в LocalStorage
  }

  static loadFromLocalStorage(): StymulusState {
    // Логика загрузки StymulusState из LocalStorage
    return new StymulusState();
  }
}

class SimulationState {
  saveToLocalStorage() {
    // Логика сохранения SimulationState в LocalStorage
  }

  static loadFromLocalStorage(): SimulationState {
    // Логика загрузки SimulationState из LocalStorage
    return new SimulationState();
  }
}

export class IDEState {
  activeScreen: "vhdl" | "stymulus" | "waveform";
  projectStorage: ProjectStorage;
  activeProject: Project | undefined;
  activeFile: ProjectFile | undefined;
  editorLine: number | undefined;
  needsRecompilation: boolean;
  stymulusState: StymulusState;
  simulationState: SimulationState;

  constructor(
    activeScreen: "vhdl" | "stymulus" | "waveform",
    projectStorage: ProjectStorage,
    stymulusState: StymulusState,
    simulationState: SimulationState,
    needsRecompilation: boolean = false,
    activeProject?: Project,
    activeFile?: ProjectFile,
    editorLine?: number
  ) {
    this.activeScreen = activeScreen;
    this.projectStorage = projectStorage;
    this.stymulusState = stymulusState;
    this.simulationState = simulationState;
    this.needsRecompilation = needsRecompilation;
    this.activeProject = activeProject;
    this.activeFile = activeFile;
    this.editorLine = editorLine;
  }

  saveToLocalStorage() {
    localStorage.setItem(
      "IDEState",
      JSON.stringify({
        activeScreen: this.activeScreen,
        projectStorage: this.projectStorage.saveToLocalStorage(),
        activeProjectName: this.activeProject ? this.activeProject.name : "",
        activeFileName: this.activeFile ? this.activeFile.name : "",
        editorLine: this.editorLine,
        needsRecompilation: this.needsRecompilation,
        stymulusState: this.stymulusState.saveToLocalStorage(),
        simulationState: this.simulationState.saveToLocalStorage(),
      })
    );
  }

  static loadFromLocalStorage(): IDEState {
    const data = JSON.parse(localStorage.getItem("IDEState") || "{}");

    const projectStorage = ProjectStorage.loadFromLocalStorage();
    const stymulusState = StymulusState.loadFromLocalStorage();
    const simulationState = SimulationState.loadFromLocalStorage();

    let activeProject;
    if (data.activeProjectName) {
      // Реализовать поиск по имени проекта data.activeProjectName в projectStorage.projects и присвоить найденный проект переменной activeProject
    }

    let activeFile;
    if (data.activeFileName && activeProject) {
      // Реализовать поиск по имени файла data.activeFileName в файлах activeProject и присвоить найденный файл переменной activeFile
    }

    return new IDEState(
      data.state,
      projectStorage,
      stymulusState,
      simulationState,
      data.needsRecompilation,
      activeProject,
      activeFile,
      data.editorLine
    );
  }
}
