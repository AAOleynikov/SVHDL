import { defineStore } from "pinia";

export const useConsoleStore = defineStore("console", {
  state: () => ({
    isConsoleOpened: false,
    isConsoleAvailable: false,
    consoleText: "",
  }),

  actions: {
    setConsoleText(text: string) {
      this.consoleText = text;
      this.isConsoleAvailable = true;
    },
    closeConsole() {
      this.isConsoleOpened = false;
    },
    clearConsole() {
      this.consoleText = "";
      this.isConsoleAvailable = false;
    },
    openConsole() {
      this.isConsoleOpened = true;
      console.log("Opening console!", this);
    },
  },
});
