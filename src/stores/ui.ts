import { defineStore } from "pinia";

export type UiScreen = "vhdl" | "stymulus" | "waveform";

interface UIState {
  console: {
    isConsoleOpened: boolean;
    isConsoleAvailable: boolean;
    consoleText: string;
  };
  isLoading: boolean;
  activeScreen: UiScreen;
}

export const useUIStore = defineStore("userInterface", {
  state: (): UIState => {
    return {
      console: {
        isConsoleOpened: false,
        isConsoleAvailable: false,
        consoleText: "",
      },
      isLoading: false,
      activeScreen: "vhdl",
    };
  },

  actions: {
    setConsoleText(text: string) {
      this.console.consoleText = text;
      this.console.isConsoleAvailable = true;
    },
    closeConsole() {
      this.console.isConsoleOpened = false;
    },
    clearConsole() {
      this.console.consoleText = "";
      this.console.isConsoleAvailable = false;
    },
    openConsole() {
      this.console.isConsoleOpened = true;
    },
  },
});
