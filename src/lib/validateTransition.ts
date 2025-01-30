/** Определить, имеет ли право пользователь переходить между вкладками. Выдать ошибку, если не имеет */

import { useUIStore } from "@/stores/ui";
import { IDEState } from "./ideState";
import { Screen } from "@/stores/ui";

/** @returns экран, на который перебросить пользователя */
export function validateTransition(
  ide_state: IDEState,
  screenFrom: Screen,
  screenTo: Screen
): Screen {
  if (screenTo == "vhdl") return screenTo;

  if (ide_state.isEverythingSaved() == false) {
    ide_state.addToastMessage({
      title: "Save first",
      type: "error",
      text: "Before setting up stymulus, you should save your project",
      buttonText: "Save all",
      buttonCallback: () => {
        ide_state.saveAll();
      },
    });
    return "vhdl";
  }

  if (ide_state.activeProject == undefined) {
    ide_state.addToastMessage({
      title: "No project selected",
      type: "error",
    });
    return "vhdl";
  }

  if (
    ide_state.stymulusState === undefined ||
    ide_state.stymulusState.isOutdated
  ) {
    ide_state.addToastMessage({
      title: "Compile first",
      type: "error",
      text: "Before setting up stymulus, you should compile your project",
      buttonText: "Compile",
      buttonCallback: () => {
        ide_state.compile();
      },
    });
    return "vhdl";
  }

  if (screenTo === "waveform" && ide_state.simulationState === undefined) {
    ide_state.addToastMessage({
      title: "Run simulation first",
      type: "error",
    });
    return screenFrom;
  }

  if (
    ide_state.stymulusState.topLevelFile === undefined ||
    ide_state.stymulusState.topLevelEntity === undefined
  ) {
    ide_state.addToastMessage({
      title: "Select top-level entity first",
      type: "error",
      text: "Before setting up stymulus, you should select top-level entity",
    });
    return "vhdl";
  }

  if (useUIStore().console.isConsoleAvailable === true) {
    ide_state.addToastMessage({
      title: "Compilation failed",
      type: "error",
      text: "Before setting up stymulus, compilation should be successful",
      buttonText: "Open console",
      buttonCallback: () => {
        useUIStore().openConsole();
      },
    });
    return "vhdl";
  }

  return screenTo;
}
