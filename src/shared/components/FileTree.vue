<script setup lang="ts">
import { reactive, computed } from "vue";
import { Project, ProjectFile } from "@/lib/projectSystem";
import { IDEState } from "@/lib/ideState";
import Tree, { IKey, MenuAction, TreeData } from "./TreeDisplay.vue";
import ModalDialog, { DialogParams, ModalDialogState } from "./ModalDialog.vue";
import JSZip from "jszip";
import { ParsedEntity } from "@/lib/parsedFile";

const ide_state = defineModel<IDEState>();

const dialogState = reactive<ModalDialogState>({
  isOpened: false,
  title: "No dialog should be shown",
  type: "yesno",
});

// Скачать Blob
const saveAs = (content: BlobPart, name: string) => {
  const blob = new Blob([content]);

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = data;
  link.download = name;

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data);
    link.remove();
  }, 100);
};

// Открыть диалог для подтверждения удаления или ввода названия файла/проекта
const openDialog = (params: DialogParams) => {
  dialogState.title = params.title;
  dialogState.callback = params.callback;
  dialogState.inputValue = params.inputValue;
  dialogState.type = params.type;
  dialogState.isOpened = true;
};

const treeData = computed<TreeData>(() => {
  if (ide_state.value === undefined) {
    throw new Error("ide_state is undefined");
  }
  const data: TreeData = {
    title: "SVHDL Projects",
    key: { type: "storage" },
    icon: "bi-archive",
    children: [],
  };
  for (const proj of ide_state.value.projectStorage.projects) {
    const projectData: TreeData = {
      title: proj.name,
      key: { type: "project", assocObj: proj },
    };
    if (proj === ide_state.value.activeProject) {
      projectData.isBold = true;
      projectData.children = [];
      for (const file of proj.files) {
        const fileData: TreeData = {
          title: file.name,
          key: { type: "file", assocObj: file },
          badges: [],
          icon: "bi-file-earmark",
        };
        if (file.isUnsaved) fileData.badges.push("bi-dot");
        if (file === ide_state.value.activeFile) {
          fileData.badges.push("bi-pen");
          if (ide_state.value.stymulusState !== undefined) {
            const parsedAnalog =
              ide_state.value.stymulusState.parsingResult.vhdlFiles.find(
                (a) => {
                  return a.fileName == file.name;
                }
              );
            if (parsedAnalog) {
              fileData.children = [];
              for (const entity of parsedAnalog.entities) {
                const entityData: TreeData = {
                  title: entity.name,
                  key: { type: "entity", assocObj: entity },
                  icon: "bi-explicit",
                };
                if (
                  ide_state.value.stymulusState &&
                  ide_state.value.stymulusState.topLevelFile &&
                  entity.fileName ==
                    ide_state.value.stymulusState.topLevelFile.fileName &&
                  entity.name ==
                    ide_state.value.stymulusState.topLevelEntity.name
                ) {
                  entityData.icon = "bi-explicit-fill";
                }
                fileData.children.push(entityData);
              }
              for (const arch of parsedAnalog.architectures) {
                const entityData: TreeData = {
                  title: arch.name,
                  key: { type: "architecture", assocObj: arch },
                  icon: "bi-amazon",
                };
                fileData.children.push(entityData);
              }
            }
          }
        }
        projectData.children.push(fileData);
      }
    }
    data.children.push(projectData);
  }

  return data;
});

const getMenuFunction = (key: IKey): (MenuAction | "---")[] => {
  const menu: (MenuAction | "---")[] = [];
  if (key.type == "architecture") {
    menu.push({ text: "Just architecture" }, { text: "Nothin' more" });
  } else if (key.type == "entity") {
    const entity = key.assocObj as ParsedEntity;
    menu.push({
      text: "Set Entity as Top-Level",
      icon: "ui-icon-star",
      callback: () => {
        ide_state.value.stymulusState.setTopLevelEntity(entity);
      },
    });
  } else if (key.type == "file") {
    const file: ProjectFile = key.assocObj as ProjectFile;
    menu.push(
      {
        text: "Rename",
        icon: "ui-icon-pencil",
        callback: () => {
          openDialog({
            title: "Name of this file",
            type: "input",
            inputValue: "" + file.name,
            callback: (newName: string) => {
              file.proj.renameFile(file.name, newName);
            },
          });
        },
      },
      {
        text: "Delete",
        icon: "ui-icon-trash",
        callback: () => {
          openDialog({
            title: "Remove file " + file.name + "?",
            callback: () => {
              file.proj.deleteFile(file.name);
            },
            type: "yesno",
          });
        },
      },

      { text: "----" },
      {
        text: "Download file",
        icon: "ui-icon-arrowthick-1-s",
        callback: (key: IKey) => {
          const assocObj = key.assocObj as ProjectFile;
          saveAs(assocObj.code, assocObj.name);
        },
      }
    );
  } else if (key.type == "project") {
    const project: Project = key.assocObj;
    if (key.assocObj == ide_state.value.activeProject) {
      // Активный проект
      menu.push(
        {
          text: "Rename Project",
          icon: "ui-icon-pencil",
        },
        {
          text: "New File",
          icon: "ui-icon-plus",
          callback: (key: IKey) => {
            openDialog({
              title: "Name for new file",
              type: "input",
              callback: (fileName: string) => {
                project.newFile(fileName);
              },
            });
          },
        }
      );
    } else {
      // Неактивный проект
      menu.push({
        text: "Set Project as Active",
        icon: "ui-icon-power",
        callback: (key: IKey) => {
          ide_state.value.setProjectActive(key.assocObj.name);
        },
      });
    }
    // Для любого проекта
    menu.push(
      "---",
      {
        text: "Delete Project",
        icon: "ui-icon-trash",
        callback: (key: IKey) => {
          openDialog({
            title: "Remove project " + project.name + "?",
            callback: () => {
              ide_state.value.projectStorage.deleteProject(project.name);
            },
            type: "yesno",
          });
        },
      },
      {
        text: "Download as ZIP",
        icon: "ui-icon-disk",
        callback: (key: IKey) => {
          const zip = new JSZip();
          key.assocObj.files.forEach(function (file) {
            zip.file(file.name, file.code);
          });
          zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, `${key.assocObj.name}.zip`);
          });
        },
      }
    );
  } else if (key.type == "storage") {
    // Контекстное меню, которое должно открываться при ПКМ на корень дерева проектов
    menu.push(
      {
        text: "New project",
        icon: "ui-icon-plusthick",
        callback: () => {
          openDialog({
            title: "Name for new project",
            type: "input",
            callback: (projectName: string) => {
              ide_state.value.projectStorage.newProject(projectName);
            },
          });
        },
      },
      {
        text: "Remove ALL PROJECTS",
        icon: "ui-icon-cancel",
        callback: (key: IKey) => {
          openDialog({
            title: `Remove ${ide_state.value.projectStorage.count()} projects from SVHDL?`,
            callback: () => {
              ide_state.value.projectStorage.deleteAllProjects();
            },
            type: "yesno",
          });
        },
      }
    );
  } else menu.push({ text: "No actions" });

  return menu;
};

const selectCallback = (key: IKey) => {
  if (key.type == "file") {
    ide_state.value.activeFile = key.assocObj;
  } else if (key.type == "project" || key.type == "storage") {
    ide_state.value.activeFile = undefined;
  }
};
</script>

<template>
  <ModalDialog v-model="dialogState" />
  <Tree
    :data="treeData"
    :get-menu-function="getMenuFunction"
    :select-callback="selectCallback" />
</template>
