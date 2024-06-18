import { ProjectStorage, Project, ProjectFile } from "./projectSystem";
import {
  ParsedVhdlFile,
  ParsedArchitecture,
  ParsedEntity,
  ParsedSignal,
  ParsedProject,
} from "./parsedFile";
import { ParsedVCD } from "@/vcd_tools/vcd2json";
import { toast } from "vue-sonner";
import { processCode } from "@/parse/parser";

export type Screen = "vhdl" | "stymulus" | "waveform";

export class ToastMessage {
  title: string;
  text?: string;
  type: "warning" | "error" | "success" | "info" = "info";
  buttonText?: string;
  buttonCallback?: Function;
}

export class StymulusConfig {
  ide_state: IDEState;
  project: Project;
  parsingResult: ParsedProject;
  topLevelFile?: ParsedVhdlFile;
  topLevelEntity?: ParsedEntity;
  inputSignalsConfig: object;
  isOutdated: boolean;
  constructor(ide_state: IDEState, project: Project) {
    this.ide_state = ide_state;
    this.project = project;
    this.parsingResult = new ParsedProject();

    const data: any = localStorage.getItem(`stymulus_${project.name}`);
    if (data != undefined) {
      this.parsingResult = new ParsedProject(data.parsingResult);
    } else this.isOutdated = true;
  }
  save() {
    const data: any = {};
    data.parsingResult = this.parsingResult.toJson(); // TODO
  }
  updateParsing() {
    this.parsingResult = new ParsedProject();
    for (let file of this.project.files) {
      this.parsingResult.addFile(processCode(file.code, file.name));
    }
    console.log(this.parsingResult);
    this.save();
    this.isOutdated = false;
  }
  setTopLevelEntity(entity: ParsedEntity) {
    const file = this.parsingResult.vhdlFiles.find((a) => {
      return a.fileName == entity.fileName;
    });
    this.topLevelFile = file;
    this.topLevelEntity = entity;
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
    return (
      !this.projectStorage.hasUnsavedChanges &&
      !this.projectStorage.projectSetUpdated
    );
  }

  constructor() {}
  /** Сохраняет только состояние IDE, не сохраняет файлы! */
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
      ide_state.setProjectActive(data.activeProjectName);
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
    this.stymulusState = new StymulusConfig(this, this.activeProject);
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
    this.updateStymulusState();
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
    this.updateStymulusState();
    this.stymulusState.updateParsing();
  }
  updateStymulusState() {
    this.stymulusState = new StymulusConfig(this, this.activeProject);
  }
}
