import { defineStore } from "pinia";

export const useEditorScreenStore = defineStore("editor_screen", {
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
      this.isConsoleAvailable = false;
    },
    openConsole() {
      this.isConsoleOpened = true;
    },
  },
});
