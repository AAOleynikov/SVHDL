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
import { ConstStymulus, Stymulus } from "@/testbench_generator/stymulus";
import { assert } from "@vueuse/core";
import { parseRange } from "@/lib/measureUnits";
import { ValidationResultFromServer, validate } from "./serverWorks";
import { useConsoleStore } from "@/stores/console";

export type Screen = "vhdl" | "stymulus" | "waveform";

export class ToastMessage {
  title: string;
  text?: string;
  type: "warning" | "error" | "success" | "info" = "info";
  buttonText?: string;
  buttonCallback?: Function;
}

type StymulusConfigJson = {
  parsingResult: any;
  topLevelFileName?: string;
  topLevelEntityName?: string;
  isOutdated: boolean;
};

export class StymulusConfig {
  ide_state: IDEState;
  project: Project;
  parsingResult: ParsedProject;
  topLevelFile?: ParsedVhdlFile;
  topLevelEntity?: ParsedEntity;
  isOutdated: boolean;
  stymulusList: Map<string, Stymulus>;
  constructor(ide_state: IDEState, project: Project) {
    this.ide_state = ide_state;
    this.project = project;
    this.parsingResult = new ParsedProject();

    const rawData: string | null = localStorage.getItem(
      `stymulus_${project.name}`
    );
    if (rawData !== null) {
      const data: StymulusConfigJson = JSON.parse(rawData);
      console.log("data", data);
      this.isOutdated = data.isOutdated;
      this.parsingResult = new ParsedProject(data.parsingResult);
      this.topLevelFile = this.parsingResult.vhdlFiles.find((a) => {
        return a.fileName === data.topLevelFileName;
      });
      if (this.topLevelFile) {
        this.topLevelEntity = this.topLevelFile.entities.find((a) => {
          return a.name === data.topLevelEntityName;
        });
      }
    } else {
      this.isOutdated = true;
      this.parsingResult = new ParsedProject();
    }
  }
  save() {
    const data: StymulusConfigJson = {
      parsingResult: this.parsingResult.toJson(),
      isOutdated: this.isOutdated,
      topLevelEntityName: this.topLevelEntity
        ? this.topLevelEntity.name
        : undefined,
      topLevelFileName: this.topLevelFile
        ? this.topLevelFile.fileName
        : undefined,
    };
    console.log("serialized data", data);
    const serializedData = JSON.stringify(data);
    localStorage.setItem("stymulus_" + this.project.name, serializedData);
  }
  updateParsing() {
    this.parsingResult = new ParsedProject();
    for (let file of this.project.files) {
      this.parsingResult.addFile(processCode(file.code, file.name));
    }
    try {
      // Проверка на то, остался ли файл верхнего уровня и осталась ли top-level сущность после обновления парсинга
      const fileAnalog = this.parsingResult.vhdlFiles.find((a) => {
        return a.fileName == this.topLevelFile.fileName;
      });
      const entityAnalog = fileAnalog.entities.find((a) => {
        return a.name == this.topLevelEntity.name;
      });
      if (entityAnalog.name.length) {
        this.topLevelFile = fileAnalog;
        this.topLevelEntity = entityAnalog;
      } else {
        this.topLevelFile = undefined;
        this.topLevelEntity = undefined;
      }
    } catch {
      this.topLevelFile = undefined;
      this.topLevelEntity = undefined;
    }
    this.save();
    this.isOutdated = false;
  }
  updateStymulusList() {
    this.stymulusList = new Map();
    if (this.topLevelEntity !== undefined) {
      for (let port of this.topLevelEntity.ports) {
        if (port.mode == "in") {
          if (port.type.startsWith("std_logic_vector")) {
            const diap = parseRange(port.type);
            for (let index of diap) {
              this.stymulusList.set(
                port.name + `(${index})`,
                new ConstStymulus("0")
              );
            }
          } else {
            this.stymulusList.set(port.name, new ConstStymulus("0"));
          }
        }
      }
    }
  }
  setTopLevelEntity(entity: ParsedEntity) {
    const file = this.parsingResult.vhdlFiles.find((a) => {
      return a.fileName == entity.fileName;
    });
    this.topLevelFile = file;
    this.topLevelEntity = entity;
    this.save();
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
  valResult?: ValidationResultFromServer;
  activeProjectNeedsRecompilation: boolean = true;
  projectStorage: ProjectStorage;
  stymulusState?: StymulusConfig;
  simulationState?: SimulationState;
  isLoading: boolean = false;
  consoleStore: ReturnType<typeof useConsoleStore>;

  isEverythingSaved() {
    return (
      !this.projectStorage.hasUnsavedChanges &&
      !this.projectStorage.projectSetUpdated
    );
  }

  constructor() {
    this.consoleStore = useConsoleStore();
  }
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
    this.stymulusState.updateStymulusList();
    validate(this.activeProject, this);
  }
  finishCompilation(result: ValidationResultFromServer) {
    console.log("asdfaddfsafadsfsdafsdafdsaafds");
    if (result !== undefined) {
      if (result.success) {
        this.consoleStore.clearConsole();
        this.addToastMessage({
          type: "success",
          title: "Compilation successful",
        });
      } else {
        this.consoleStore.setConsoleText(result.errors.join("\n"));
        this.addToastMessage({
          type: "error",
          title: "Compilation error",
          buttonText: "Open console",
          buttonCallback: () => {
            this.consoleStore.openConsole();
          },
        });
      }
    }
  }
  updateStymulusState() {
    this.stymulusState = new StymulusConfig(this, this.activeProject);
  }
}
