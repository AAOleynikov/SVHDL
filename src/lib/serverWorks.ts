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
  const reqData: ProjectToServer = {
    files: proj.files.map((a) => {
      return { fileName: a.name, fileContent: a.code };
    }),
    topLevelEntity: "",
  };
  console.log("reqData", reqData);
  ide_state.isLoading = true;
  const request = instance
    .post("/validate", { data: reqData })
    .then((resp) => {
      ide_state.isLoading = false;
      ide_state.finishCompilation(resp.data);
    })
    .catch(() => {
      ide_state.isLoading = false;
    });
}
