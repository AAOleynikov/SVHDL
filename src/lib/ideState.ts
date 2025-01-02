import { ProjectStorage, Project, ProjectFile } from "./projectSystem";
import { ParsedVhdlFile, ParsedEntity, ParsedProject } from "./parsedFile";
import { ParsedVCD } from "@/vcd_tools/vcd2json";
import { toast } from "vue-sonner";
import { processCode } from "@/parse/parser";
import { Time, parseRange, timeToFs } from "@/lib/measureUnits";
import { ValidationResultFromServer, simulate, validate } from "./serverWorks";
import { useConsoleStore } from "@/stores/console";
import {
  CodeGeneratorData,
  GeneratorStymulus,
  TestbenchGenerator,
} from "@/testbench_generator/gen";

export type Screen = "vhdl" | "stymulus" | "waveform";

export class ToastMessage {
  title: string;
  text?: string;
  type: "warning" | "error" | "success" | "info" = "info";
  buttonText?: string;
  buttonCallback?: () => void;
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
  stymulusList: Map<string, GeneratorStymulus>;
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
    for (const file of this.project.files) {
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
      for (const port of this.topLevelEntity.ports) {
        if (port.mode == "in") {
          if (port.type.startsWith("std_logic_vector")) {
            const diap = parseRange(port.type);
            for (const index of diap) {
              this.stymulusList.set(port.name + `(${index})`, {
                stimulus_type: "Const",
                value: "0",
                nameOfTarget: port.name + `(${index})`,
              });
            }
          } else {
            this.stymulusList.set(port.name, {
              stimulus_type: "Const",
              value: "0",
              nameOfTarget: port.name,
            });
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
  vcd: string = "";
  curSTime: number;

  isEverythingSaved() {
    return (
      !this.projectStorage.hasUnsavedChanges &&
      !this.projectStorage.projectSetUpdated
    );
  }

  constructor() {
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
    if (ide_state.activeScreen === "waveform") ide_state.activeScreen = "vhdl";

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
    const console = useConsoleStore();
    if (result !== undefined) {
      if (result.success) {
        console.clearConsole();
        this.addToastMessage({
          type: "success",
          title: "Compilation successful",
        });
      } else {
        console.setConsoleText(result.errors.join("\n"));
        this.addToastMessage({
          type: "error",
          title: "Compilation error",
          buttonText: "Open console",
          buttonCallback: () => {
            console.openConsole();
          },
        });
      }
    }
  }
  updateStymulusState() {
    this.stymulusState = new StymulusConfig(this, this.activeProject);
  }
  startSimulation(firstStepSize: Time) {
    this.curSTime = timeToFs(firstStepSize);
    const stims: GeneratorStymulus[] = [];
    this.stymulusState.stymulusList.forEach((a) => {
      stims.push(a);
    });
    console.log(stims);
    const genData: CodeGeneratorData = {
      header_declaration: "library ieee;\nuse ieee.std_logic_1164.all;",
      entity: {
        name: this.stymulusState.topLevelEntity.name,
        ports: this.stymulusState.topLevelEntity.ports.map((a) => {
          return {
            name: a.name,
            sub_type: a.mode,
            type: a.type
              .replace("to", " to ")
              .replace("downto", " downto ")
              .replace("std_logic_vec to r", "std_logic_vector"),
          };
        }),
      },
      architectures: [],
      preferred_arch_name: this.stymulusState.topLevelEntity.name + "_tb",
      stimulus: stims,
    };
    const tbGen = new TestbenchGenerator(genData);
    const fileCode = tbGen.vhdl;
    const filesToServak = this.activeProject.files.map((a) => {
      return { fileName: a.name, fileContent: a.code };
    });
    filesToServak.push({ fileName: "testbench.vhdl", fileContent: fileCode });
    simulate(
      {
        files: filesToServak,
        simTimeFs: this.curSTime,
        topLevelEntity: this.stymulusState.topLevelEntity.name + "_tb",
      },
      this
    );
  }
  finishSimulation(data: { vcd: string }) {
    this.vcd = data.vcd;
    this.activeScreen = "waveform";
  }
}
