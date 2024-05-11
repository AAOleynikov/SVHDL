<script setup lang="ts">
import { onMounted, defineProps, reactive, watch, ref } from "vue";
import $ from "jquery";
import "jquery-ui/themes/base/all.css";
import "jquery-ui/dist/jquery-ui";
import "ui-contextmenu/jquery.ui-contextmenu.min";
import "jquery.fancytree/dist/skin-lion/ui.fancytree.less";
import "jquery.fancytree/dist/modules/jquery.fancytree.edit";
import "jquery.fancytree/dist/modules/jquery.fancytree.filter";
import { createTree } from "jquery.fancytree";
import { Project, ProjectStorage } from "@/lib/projectSystem";
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
import JSZip from "JSZip";

const props = defineProps({ data: ProjectStorage });
const emit = defineEmits(["update:data"]);
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
  if (window.navigator && window.navigator.msSaveOrOpenBlob)
    return window.navigator.msSaveOrOpenBlob(blob);

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
  const storage: ProjectStorage = props.data;
  if (orig == "newFile") {
    storage.activeProject.newFile(name);
    storage.saveAll();
  } else if (orig == "newProject") {
    storage.newProject(name);
    storage.setProjectActive(name);
    storage.saveAll();
  } else if (orig == "deleteFile") {
    storage.activeProject.deleteFile(whatAffected.value);
    storage.saveAll();
  } else if (orig == "deleteProject") {
    storage.deleteProject(whatAffected.value);
    storage.saveAll();
  } else if (orig == "deleteAll") {
    storage.deleteAllProjects();
    storage.saveAll();
  } else if (orig == "renameProject") {
    storage.renameProject(whatAffected.value, name);
    storage.saveAll();
  } else if (orig == "renameFile") {
    //TODO
    storage.saveAll();
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
    deleteAll: `Уверены, что хотите удалить ${props.data.count()} проектов?`,
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
  const storage: ProjectStorage = props.data;
  realTree = reactive([
    {
      title: "MVHDL Projects",
      icon: "bi-archive",
      folder: true,
      key: "master",
      children: [],
      expanded: true,
    },
  ]);
  if (storage) {
    for (let proj of storage.projects) {
      realTree[0].children.push({
        title:
          (proj == storage.activeProject ? "<b>" : "") +
          proj.name +
          (proj == storage.activeProject ? "</b>" : ""),
        folder: true,
        expanded: true,
        key: "project_" + proj.name,
        children: [],
      });
      if (proj == storage.activeProject) {
        for (let file of proj.files) {
          realTree[0].children[realTree[0].children.length - 1].children.push({
            title:
              (file === proj.activeFile ? '<i class="bi-pen mr-2"></i>' : "") +
              (file.isUnsaved ? '<i class="bi-dot mr-2"></i>' : "") +
              file.name,
            key: "file_" + file.name,
            icon:
              file == storage.activeProject.topLevelFile
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
  const storage: ProjectStorage = props.data;
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
      storage.setProjectActive(projectName);
      fullyReloadTree();
    }
    if (data.cmd == "create-file") {
      openDialog("newFile", projectName);
    }
    if (data.cmd == "read-project") {
      var zip = new JSZip();
      storage.activeProject.files.forEach(function (file) {
        zip.file(file.name, file.code);
      });
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${storage.activeProject.name}.zip`);
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
      storage.activeProject.setTopLevelFile(fileName);
      fullyReloadTree();
    }
    if (data.cmd == "read-file") {
      const file = storage.activeProject.files.find((a) => a.name == fileName);
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
      (props.data.activeProject ?? {
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
  $("#tree").contextmenu({ menu });
};

//
const onSelectTreeElement = (event, data) => {
  const storage = props.data;
  const key = data.node.key;
  if (key.startsWith("file_"))
    storage.activeProject.setActiveFile(key.slice("file_".length));
  else if (storage.activeProject) storage.activeProject.activeFile = undefined;
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
watch(props["data"], async (newData, oldData) => {
  fullyReloadTree();
  if (tree != null) {
    tree.reload();
  }
});
</script>

<template>
  <DialogRoot v-model:open="dialogOpen">
    <DialogPortal>
      <DialogOverlay class="bg-black opacity-50 fixed inset-0 z-30" />
      <DialogContent
        class="fixed top-[50%] left-[50%] max-h-30 w- max-w-96 translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] z-[100]"
      >
        <DialogTitle class="m-0 text-[17px] font-semibold">
          {{ dialogHeader }}
        </DialogTitle>
        <DialogDescription class="mt-[10px] mb-5 text-[15px] leading-normal">
          <Alert
            variant="destructive"
            class="flex flex-row gap-4"
            v-if="dialogType == 'confirm'"
          >
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
          class="mb-8"
        />

        <div class="mt-2 flex justify-end gap-5">
          <DialogClose>
            <button
              @click="dialogConfirm"
              class="rounded-md bg-red-500 px-2 py-1 text-white font-bold"
            >
              <i class="bi-check-lg font-bold mr-1"></i>Ок
            </button>
          </DialogClose>
          <DialogClose>
            <button
              class="rounded-md bg-green-500 px-2 py-1 text-white font-bold"
            >
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
