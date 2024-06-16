import { onClickOutside } from "@vueuse/core";
import {
  ProjectStorage,
  Project,
  ProjectFile,
  SimulationState,
  StymulusConfig,
} from "./projectSystem";

import { toast } from "vue-sonner";

export type Screen = "vhdl" | "stymulus" | "waveform";

export class ToastMessage {
  title: string;
  text?: string;
  type: "warning" | "error" | "success" | "info" = "info";
  buttonText?: string;
  buttonCallback?: Function;
}

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
    stConfig.parsingResult = {};
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

export class IDEState {
  activeScreen: Screen;
  activeProject?: Project;
  activeFile?: ProjectFile;
  editorLine?: number;
  activeProjectNeedsRecompilation: boolean = true;
  projectStorage: ProjectStorage;
  stymulusState?: StymulusConfig;
  simulationState?: SimulationState;

  isEverythingSaved() {
    return !this.projectStorage.hasUnsavedChanges;
  }

  constructor() {}
  /** Сохраняет только состояние IDE, не более того! */
  saveToLocalStorage() {
    localStorage.setItem(
      "IDEState",
      JSON.stringify({
        activeScreen: this.activeScreen,
        activeProjectName: this.activeProject ? this.activeProject.name : "",
        activeFileName: this.activeFile ? this.activeFile.name : "",
        editorLine: this.editorLine ?? 0,
      })
    );
  }
  static loadFromLocalStorage(): IDEState {
    const ide_state: IDEState = new IDEState();
    ide_state.projectStorage = ProjectStorage.loadFromLocalStorage();
    const data = JSON.parse(localStorage.getItem("IDEState") || "{}");

    ide_state.activeScreen = data.activeScreen ?? "vhdl";

    if (data.activeProjectName) {
      ide_state.activeProject = ide_state.projectStorage.getProjectByName(
        data.activeProjectName
      );
      if (data.activeFileName) {
        ide_state.activeFile = ide_state.activeProject.getFileByName(
          data.activeFileName
        );
        ide_state.editorLine = data.editorLine ?? 0;
      }
    }
    return ide_state;
  }
  setProjectActive(projectName: string) {
    this.activeProject = this.projectStorage.getProjectByName(projectName);
    this.simulationState = SimulationState.loadFromLocalStorage(
      this.projectStorage,
      projectName
    );
    this.stymulusState = StymulusConfig.loadFromLocalStorage(
      this.projectStorage,
      projectName
    );
  }
  addToastMessage(message: ToastMessage) {
    const data: any = {};
    if (message.text) data.description = message.text;
    if (message.buttonText) {
      data.action = {
        label: message.buttonText,
        onClick: message.buttonCallback,
      };
    }
    if (message.type == "error") {
      toast.error(message.title, data);
    } else if (message.type == "success") {
      toast.success(message.title, data);
    } else if (message.type == "warning") {
      toast.warning(message.title, data);
    } else {
      toast.info(message.title, data);
    }
  }
  saveAll() {
    if (this.projectStorage.saveAll())
      this.addToastMessage({ type: "success", title: "Saved!" });
    else
      this.addToastMessage({
        type: "info",
        title: "Everything is already saved!",
      });
  }
  discardAll() {
    this.projectStorage = ProjectStorage.loadFromLocalStorage();
    const activeFileName = this.activeFile.name;
    this.setProjectActive(this.activeProject.name);
    this.setActiveFile(activeFileName);
    this.addToastMessage({ title: "Changes discarded!", type: "success" });
  }
  setActiveFile(name: string) {
    this.activeFile = this.activeProject.getFileByName(name);
    console.log(this.activeFile);
  }
  compile() {
    if (!this.isEverythingSaved()) {
      this.addToastMessage({
        title: "Save first",
        type: "error",
        text: "Before compiling, you should save your project",
        buttonText: "Save all",
        buttonCallback: () => {
          this.saveAll();
        },
      });
      return;
    }
    this.ensureStymulusState();
    this.updateParsing();
  }
  ensureStymulusState() {
    if (this.stymulusState == undefined)
      this.stymulusState = new StymulusConfig(this, this.activeProject);
  }
}
