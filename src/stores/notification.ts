import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    isDialogOpened: false,
    dialogText: "",
  }),

  actions: {
    openDialog(text: string) {
      this.isDialogOpened = true;
      this.dialogText = text;
    },

    closeDialog() {
      this.isDialogOpened = false;
      this.dialogText = "";
    },
  },
});
