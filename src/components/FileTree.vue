<script setup lang="ts">
import { onMounted, defineProps, reactive, watch, ref } from "vue";
import $ from "jquery";
import "jquery-ui/themes/base/all.css";
import "jquery-ui/dist/jquery-ui";
import "ui-contextmenu/jquery.ui-contextmenu.min";
import "jquery.fancytree/dist/skin-lion/ui.fancytree.less";
import "jquery.fancytree/dist/modules/jquery.fancytree.edit";
import "jquery.fancytree/dist/modules/jquery.fancytree.filter";
import { createTree } from "jquery.fancytree"; // На ошибку похуй
import { Project, ProjectStorage } from "@/lib/projectSystem";
import { IDEState } from "@/lib/ideState";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "radix-vue";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import JSZip from "jszip";

const ide_state = defineModel<IDEState>();
const dialogOpen = ref(false); // Открыт ли диалог
const dialogType = ref("confirm"); // confirm - подтвердить удаление проекта/всех проектов, input - ввод названия проекта/файла

/** newFile - ввод названия файла
 * newProject - ввод названия проекта
 * deleteFile - удаление одного файла
 * deleteProject - удаление одного проекта
 * deleteAll - удаление всех проектов
 * renameProject - переименование проекта
 * renameFile - переименование файла
 */
const dialogOrigin = ref("newFile");

const whatAffected = ref(""); // Какой проект/файл затрагивает этот диалог
const dialogHeader = ref(""); // Заголовок диалога
const dialogInput = ref(""); // v-model для поля ввода в диалоге
var tree = null; // Указатель на jquery-объект дерева

const saveAs = (content, name) => {
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

// Функция, которая вызывается, когда пользователь нажимает кнопку "Ок" в диалоге
function dialogConfirm() {
  dialogOpen.value = false;
  const orig = dialogOrigin.value;
  const name = dialogInput.value;
  if (orig == "newFile") {
    ide_state.value.activeProject.newFile(name);
    ide_state.value.saveAll();
  } else if (orig == "newProject") {
    ide_state.value.projectStorage.newProject(name);
    ide_state.value.setProjectActive(name);
    ide_state.value.saveAll();
  } else if (orig == "deleteFile") {
    ide_state.value.activeProject.deleteFile(whatAffected.value);
    ide_state.value.saveAll();
  } else if (orig == "deleteProject") {
    ide_state.value.projectStorage.deleteProject(whatAffected.value);
    ide_state.value.saveAll();
  } else if (orig == "deleteAll") {
    ide_state.value.projectStorage.deleteAllProjects();
    ide_state.value.saveAll();
  } else if (orig == "renameProject") {
    if (!ide_state.value.projectStorage.renameProject(whatAffected.value, name))
      ide_state.value.addToastMessage({
        title: "Cant rename project!",
        type: "error",
      });
  } else if (orig == "renameFile") {
    if (ide_state.value.activeProject.renameFile(whatAffected.value, name)) {
    } else {
      ide_state.value.addToastMessage({
        title: "Cant rename project!",
        type: "error",
      });
    }
  } else console.error("Dialog origin is wrong");
  fullyReloadTree(); // Временное, но надёжное решение
}

// Контекстное меню, которое должно открываться при ПКМ на корень дерева проектов
const MENU_MASTER = [
  {
    title: "New project",
    cmd: "create-project",
    uiIcon: "ui-icon-plusthick",
  },
  {
    title: "Remove ALL PROJECTS",
    cmd: "delete-all-projects",
    uiIcon: "ui-icon-cancel",
  },
];

// Контекстное меню, которое должно открываться при ПКМ на активный проект
const MENU_ACTIVE_PROJECT = [
  {
    title: "Rename Project",
    cmd: "rename-project",
    uiIcon: "ui-icon-pencil",
  },
  {
    title: "Delete Project <kbd>[Del]</kbd>",
    cmd: "delete-project",
    uiIcon: "ui-icon-trash",
  },
  { title: "----" },
  {
    title: "New File",
    cmd: "create-file",
    uiIcon: "ui-icon-plus",
  },
  { title: "----" },
  {
    title: "Download as ZIP",
    cmd: "read-project",
    uiIcon: "ui-icon-disk",
  },
];

// Контекстное меню, которое должно открываться при ПКМ на неактивный проект
const MENU_INACTIVE_PROJECT = [
  {
    title: "Set Project as Active",
    cmd: "set-project-active",
    uiIcon: "ui-icon-power",
  },
  {
    title: "Delete Project <kbd>[Del]</kbd>",
    cmd: "delete-project",
    uiIcon: "ui-icon-trash",
  },
];

// Контекстное меню, которое должно открываться при ПКМ на файл внутри проекта
const MENU_FILE = [
  {
    title: "Rename",
    cmd: "rename-file",
    uiIcon: "ui-icon-pencil",
  },
  {
    title: "Delete <kbd>[Del]</kbd>",
    cmd: "delete-file",
    uiIcon: "ui-icon-trash",
  },
  {
    title: "Set File as Top-Level",
    cmd: "set-file-top-level",
    uiIcon: "ui-icon-star",
  },
  { title: "----" },
  {
    title: "Download file",
    cmd: "read-file",
    uiIcon: "ui-icon-arrowthick-1-s",
  },
];

// Контекстное меню, которое должно открываться при ПКМ на сигнал (сигналы находятся в поддереве файла)
const MENU_SIGNAL = [
  {
    title: "ЗДЕСЬ МОЖЕТ",
  },
  {
    title: "БЫТЬ ВАША",
  },
  {
    title: "РЕКЛАМА",
  },
];

// Открыть диалог для подтверждения удаления или ввода названия файла/проекта
const openDialog = (dOrigin, affected = "") => {
  dialogOrigin.value = dOrigin;
  dialogInput.value = "";
  whatAffected.value = affected;

  if (["deleteFile", "deleteProject", "deleteAll"].includes(dOrigin))
    dialogType.value = "confirm";
  else dialogType.value = "input";

  if (["renameFile", "renameProject"].includes(dOrigin))
    dialogInput.value = affected;
  const ddd = {
    newFile: "Введите название нового файла",
    newProject: "Введите название нового проекта",
    deleteFile: `Уверены, что хотите удалить файл ${whatAffected.value}?`,
    deleteProject: `Уверены, что хотите удалить проект ${whatAffected.value}?`,
    deleteAll: `Уверены, что хотите удалить ${ide_state.value.projectStorage.count()} проектов?`,
    renameProject: `Введите новое название проекта ${whatAffected.value}`,
    renameFile: `Введите новое название файла ${whatAffected.value}`,
  };
  if (ddd.hasOwnProperty(dialogOrigin.value)) {
    dialogHeader.value = ddd[dialogOrigin.value];
  } else {
    dialogHeader.value = "ERROR IN CODE!!!!!";
    dialogOrigin.value = "asdfadsfasdfasdfadsfasdfafsdfasf";
  }
  dialogOpen.value = true;
};

// Здесь хранится дерево
let realTree = [];

// Полностью обновить дерево. Возможна потеря позиции скролла или раскрытия папок
function fullyReloadTree() {
  realTree = reactive([
    {
      title: "SVHDL Projects",
      icon: "bi-archive",
      folder: true,
      key: "master",
      children: [],
      expanded: true,
    },
  ]);
  if (ide_state.value.projectStorage) {
    for (let proj of ide_state.value.projectStorage.projects) {
      realTree[0].children.push({
        title:
          (proj == ide_state.value.activeProject ? "<b>" : "") +
          proj.name +
          (proj == ide_state.value.activeProject ? "</b>" : ""),
        folder: true,
        expanded: true,
        key: "project_" + proj.name,
        children: [],
      });
      if (proj == ide_state.value.activeProject) {
        for (let file of proj.files) {
          realTree[0].children[realTree[0].children.length - 1].children.push({
            title:
              (file === ide_state.value.activeFile
                ? '<i class="bi-pen mr-2"></i>'
                : "") +
              (file.isUnsaved ? '<i class="bi-dot mr-2"></i>' : "") +
              file.name,
            key: "file_" + file.name,
            icon:
              file == ide_state.value.activeProject.topLevelFile
                ? "bi-star-fill"
                : "bi-file-earmark-code",
          });
        }
      }
    }
  }
  if (tree != null) {
    tree.reload();
  }
}

// Запустить fullyReloadTree при создании дерева
fullyReloadTree();

// Обработка нажатия пользователем пункта в контекстном меню
const menuEvent = (event, data) => {
  const node = tree.getActiveNode();
  if (node.key == "master") {
    if (data.cmd == "create-project") {
      openDialog("newProject");
    }
    if (data.cmd == "delete-all-projects") {
      openDialog("deleteAll");
    }
  } else if (node.key.startsWith("project_")) {
    const projectName = node.key.slice("project_".length);
    if (data.cmd == "rename-project") {
      openDialog("renameProject", projectName);
    }
    if (data.cmd == "delete-project") {
      openDialog("deleteProject", projectName);
    }
    if (data.cmd == "set-project-active") {
      ide_state.value.setProjectActive(projectName);
      fullyReloadTree();
    }
    if (data.cmd == "create-file") {
      openDialog("newFile", projectName);
    }
    if (data.cmd == "read-project") {
      var zip = new JSZip();
      ide_state.value.activeProject.files.forEach(function (file) {
        zip.file(file.name, file.code);
      });
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${ide_state.value.activeProject.name}.zip`);
      });
    }
  } else if (node.key.startsWith("file_")) {
    const fileName = node.key.slice("file_".length);
    if (data.cmd == "rename-file") {
      openDialog("renameFile", fileName);
    }
    if (data.cmd == "delete-file") {
      openDialog("deleteFile", fileName);
    }
    if (data.cmd == "set-file-top-level") {
      ide_state.value.activeProject.setTopLevelFile(fileName);
      fullyReloadTree();
    }
    if (data.cmd == "read-file") {
      const file = ide_state.value.activeProject.files.find(
        (a) => a.name == fileName
      );
      saveAs(file.code, file.name);
    }
  }
};

// Функция выбирает меню, которое будет открываться при ПКМ на элемент дерева
const chooseMenuForElement = (event, ui) => {
  var node = $.ui.fancytree.getNode(ui.target);
  var menu = undefined;
  if (node.key == "master") {
    menu = MENU_MASTER;
  } else if (node.key.startsWith("project_")) {
    const projectName = node.key.slice("project_".length);
    if (
      projectName ===
      (ide_state.value.activeProject ?? {
        name: "adsfasdfasdfdasdfasdfasdfasdfasd",
      })["name"]
    ) {
      // Если ПКМ по активному проекту
      menu = MENU_ACTIVE_PROJECT;
    } else {
      menu = MENU_INACTIVE_PROJECT;
    }
  } else if (node.key.startsWith("file_")) {
    menu = MENU_FILE;
  } else {
    menu = MENU_SIGNAL;
  }
  node.setActive();
  $("#tree").contextmenu({ menu: menu });
};

//
const onSelectTreeElement = (event, data) => {
  const key = data.node.key;
  if (key.startsWith("file_"))
    ide_state.value.setActiveFile(key.slice("file_".length));
  else if (ide_state.value.activeProject)
    ide_state.value.activeProject.activeFile = undefined;
};

// Когда компонент Vue смонтирован, замутить дерево
onMounted(() => {
  tree = createTree("#tree", {
    selectMode: 3,
    source: function (event, data) {
      return realTree;
    },
    click: onSelectTreeElement,
  });
  +$("#tree").on("nodeCommand", menuEvent);
  import("jquery.fancytree/dist/skin-win7/ui.fancytree.css");

  $("#tree").contextmenu({
    delegate: "span.fancytree-node",
    menu: [],
    beforeOpen: chooseMenuForElement,
    select: function (event, ui) {
      var that = this;
      // delay the event, so the menu can close and the click event does
      // not interfere with the edit control
      setTimeout(function () {
        $(that).trigger("nodeCommand", { cmd: ui.cmd });
      }, 100);
    },
  });
});

//Обновление данных при обновлении props
watch(
  ide_state,
  async (newData, oldData) => {
    console.log("ide_state updated!");
    fullyReloadTree();
    if (tree != null) {
      tree.reload();
    }
  },
  { deep: true }
);
</script>

<template>
  <DialogRoot v-model:open="dialogOpen">
    <DialogPortal>
      <DialogOverlay class="bg-black opacity-50 fixed inset-0 z-30" />
      <DialogContent
        class="fixed top-[50%] left-[50%] max-h-30 w- max-w-96 translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] z-[100]">
        <DialogTitle class="m-0 text-[17px] font-semibold">
          {{ dialogHeader }}
        </DialogTitle>
        <DialogDescription class="mt-[10px] mb-5 text-[15px] leading-normal">
          <Alert
            variant="destructive"
            class="flex flex-row gap-4"
            v-if="dialogType == 'confirm'">
            <i class="bi-x-circle text-4xl"></i>
            <div>
              <AlertTitle>Будьте осторожны!</AlertTitle>
              <AlertDescription>
                Это действие нельзя отменить
              </AlertDescription>
            </div>
          </Alert>
        </DialogDescription>

        <Input
          v-model="dialogInput"
          v-if="dialogType == 'input'"
          @keyup.enter="dialogConfirm"
          class="mb-8" />

        <div class="mt-2 flex justify-end gap-5">
          <DialogClose>
            <button
              @click="dialogConfirm"
              class="rounded-md bg-red-500 px-2 py-1 text-white font-bold">
              <i class="bi-check-lg font-bold mr-1"></i>Ок
            </button>
          </DialogClose>
          <DialogClose>
            <button
              class="rounded-md bg-green-500 px-2 py-1 text-white font-bold">
              <i class="bi-x-lg font-bold mr-1"></i>Отмена
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
  <div id="tree" style="height: 100%"></div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
