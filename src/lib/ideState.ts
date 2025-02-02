import { ProjectStorage, Project, ProjectFile } from "./projectSystem";
import {
  ParsedVhdlFile,
  ParsedEntity,
  ParsedProject,
  ParsedFileJson,
} from "./parsedFile";
import { enrichParsedVCD, ParsedVCD, parseVCD } from "@/vcd_tools/vcd2json";
import { toast } from "vue-sonner";
import { processCode } from "@/parse/parser";
import { Time, parseRange, timeToFs } from "@/lib/measureUnits";
import { ValidationResultFromServer, simulate, validate } from "./serverWorks";
import { UiScreen, useUIStore } from "@/stores/ui";
import {
  CodeGeneratorData,
  GeneratorStymulus,
  TestbenchGenerator,
} from "@/testbench_generator/gen";

export interface ToastMessage {
  title: string;
  text?: string;
  type: "warning" | "error" | "success" | "info";
  buttonText?: string;
  buttonCallback?: () => void;
}

type StymulusConfigJson = {
  parsingResult: ParsedFileJson[];
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
    this.stymulusList = new Map();

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
    const serializedData = JSON.stringify(data);
    localStorage.setItem("stymulus_" + this.project.name, serializedData);
  }
  /**
   * Обновляет результат парсинга и, если возможно, сохраняет старые настройки сигналов
   */
  updateParsing() {
    this.parsingResult = new ParsedProject();
    this.project.files.forEach((file) => {
      this.parsingResult.addFile(processCode(file.code, file.name));
    });
    const oldTopLevelFileName = this.topLevelFile?.fileName;
    const oldTopLevelEntityName = this.topLevelEntity?.name;

    this.topLevelFile = undefined;
    this.topLevelEntity = undefined;

    const fileAnalog = this.parsingResult.vhdlFiles.find(
      (a) => a.fileName === oldTopLevelFileName
    );

    if (fileAnalog) {
      const entityAnalog = fileAnalog.entities.find(
        (a) => a.name === oldTopLevelEntityName
      );

      if (entityAnalog && entityAnalog.name.length > 0) {
        this.topLevelFile = fileAnalog;
        this.topLevelEntity = entityAnalog;
      }
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
export interface SimulationState {
  waveform: ParsedVCD;
  currentTime: number;
  hotkeyMap: Map<string, boolean>;
  hotkeyEvents: unknown[];
}

export class IDEState {
  activeScreen: UiScreen;
  activeProject?: Project;
  activeFile?: ProjectFile;
  editorLine?: number;
  valResult?: ValidationResultFromServer;
  activeProjectNeedsRecompilation: boolean = true;
  projectStorage: ProjectStorage;
  stymulusState?: StymulusConfig;
  simulationState?: SimulationState;
  vcd: string = "";
  curSTime: number = 0;

  isEverythingSaved() {
    return (
      !this.projectStorage.hasUnsavedChanges &&
      !this.projectStorage.projectSetUpdated
    );
  }

  constructor() {
    this.projectStorage = ProjectStorage.loadFromLocalStorage();
    this.activeScreen = "vhdl";
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
        ide_state.activeFile = (
          ide_state.activeProject as Project
        ).getFileByName(data.activeFileName);
        ide_state.editorLine = data.editorLine ?? 0;
      }
    }
    return ide_state;
  }
  setProjectActive(projectName: string) {
    const proj = this.projectStorage.projects.find((a) => {
      return a.name === projectName;
    });
    this.activeProject = proj;
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
    this.projectStorage = new ProjectStorage();
    if (this.activeFile === undefined || this.activeProject === undefined) {
      return;
    }
    const activeFileName = this.activeFile.name;
    this.setProjectActive(this.activeProject.name);
    this.setActiveFile(activeFileName);
    this.addToastMessage({ title: "Changes discarded!", type: "success" });
    this.updateStymulusState();
  }
  setActiveFile(name: string) {
    if (this.activeProject === undefined) {
      return;
    }
    this.activeFile = this.activeProject.getFileByName(name);
  }
  compile() {
    if (this.activeProject === undefined) {
      return;
    }
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
    (this.stymulusState as StymulusConfig).updateParsing();
    (this.stymulusState as StymulusConfig).updateStymulusList();
    validate(this.activeProject, this);
  }
  finishCompilation(result: ValidationResultFromServer) {
    const console = useUIStore();
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
    if (this.activeProject !== undefined) {
      this.stymulusState = new StymulusConfig(this, this.activeProject);
    }
  }
  startSimulation(firstStepSize: Time) {
    if (
      this.stymulusState === undefined ||
      this.stymulusState.topLevelEntity === undefined ||
      this.activeProject === undefined
    ) {
      throw new Error("No top level entity defined");
    }

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
              .replace("down to ", " downto ")
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
    console.log("Stimulus config:", this.stymulusState);
    this.vcd = data.vcd;
    try {
      this.simulationState = {
        currentTime: 0,
        hotkeyEvents: [],
        waveform: enrichParsedVCD(
          parseVCD(this.vcd),
          this.stymulusState as StymulusConfig
        ),
        hotkeyMap: new Map(),
      };
    } catch (e) {
      console.error(e);
    }
    const ui = useUIStore();
    ui.activeScreen = "waveform";
  }
}
