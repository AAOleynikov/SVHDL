import { useUIStore } from "@/stores/ui";
import { IDEState } from "./ideState";
import { Project } from "./projectSystem";
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 100000,
  headers: {},
});

export interface ProjectToServer {
  files: { fileName: string; fileContent: string }[];
  topLevelEntity: string; // uut_AndGate
  simTimeFs?: number;
}

export interface ValidationResultFromServer {
  success: boolean;
  errors: string[];
}

export interface SimulationResultFromServer {
  success: boolean;
  vcd: string;
}

export function validate(proj: Project, ide_state: IDEState) {
  const ui = useUIStore();
  const reqData: ProjectToServer = {
    files: proj.files.map((a) => {
      return { fileName: a.name, fileContent: a.code };
    }),
    topLevelEntity: "",
  };
  ui.isLoading = true;
  instance
    .post("/validate", { data: reqData })
    .then((resp) => {
      ui.isLoading = false;
      ide_state.finishCompilation(resp.data);
    })
    .catch(() => {
      ui.isLoading = false;
    });
}

export function simulate(
  filesToServak: {
    files: { fileName: string; fileContent: string }[];
    topLevelEntity: string;
    simTimeFs: number;
  },
  ide_state: IDEState
) {
  const ui = useUIStore();
  ui.isLoading = true;
  instance
    .post("/simulate", { data: filesToServak })
    .then((resp) => {
      ui.isLoading = false;
      ide_state.finishSimulation(resp.data);
    })
    .catch(() => {
      ui.isLoading = false;
    });
}
