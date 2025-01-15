import { defineStore } from "pinia";

interface UIState {
  console: {
    isConsoleOpened: boolean;
    isConsoleAvailable: boolean;
    consoleText: string;
  };
}

export const useUIStore = defineStore("userInterface", {
  state: (): UIState => {
    return {
      console: {
        isConsoleOpened: false,
        isConsoleAvailable: false,
        consoleText: "",
      },
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
