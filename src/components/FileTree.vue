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
import { Project } from "@/lib/projectSystem";
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

const props = defineProps(["data"]);
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
var tree = null;

// Функция, которая вызывается, когда пользователь нажимает кнопку "Ок" в диалоге
function dialogConfirm() {
  dialogOpen = false;
  console.log("Cy4kf");
}

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

const MENU_PROJECT = [
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
  {
    title: "Set Project as Active",
    cmd: "set-project-active",
    uiIcon: "ui-icon-power",
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

// Открыть диалог для подтверждения удаления или ввода названия файла/проекта
const openDialog = (dOrigin, affected = "") => {
  dialogOrigin.value = dOrigin;
  dialogInput.value = "";
  whatAffected.value = affected;
  if (["deleteFile", "deleteProject", "deleteAll"].includes(dOrigin))
    dialogType.value = confirm;
  else dialogType.value = "input";
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

let realTree = [];
function fullyReloadTree() {
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
  if (props.data) {
    console.log("props data", props.data);
    for (let proj of props.data.projects) {
      realTree[0].children.push({ title: proj.name, folder: true });
    }
  }
}
fullyReloadTree();

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
    if (data.cmd == "rename-project") {
    }
    if (data.cmd == "delete-project") {
    }
    if (data.cmd == "set-project-active") {
    }
    if (data.cmd == "create-file") {
    }
    if (data.cmd == "read-project") {
    }
  } else if (node.key.startsWith("file_")) {
    if (data.cmd == "rename-file") {
    }
    if (data.cmd == "delete-file") {
    }
    if (data.cmd == "set-file-top-level") {
    }
    if (data.cmd == "read-file") {
    }
  }
  fullyReloadTree();
  tree.reload();
};

// Когда компонент Vue смонтирован, замутить дерево
onMounted(() => {
  tree = createTree("#tree", {
    selectMode: 3,
    source: function (event, data) {
      return realTree;
    },

    activate: function (event, data) {
      console.log(event.type + ": " + data.node);
    },
    select: function (event, data) {
      console.log(event.type + ": " + data.node.isSelected() + " " + data.node);
    },
  });
  +$("#tree").on("nodeCommand", menuEvent);
  import("jquery.fancytree/dist/skin-win7/ui.fancytree.css");

  $("#tree").contextmenu({
    delegate: "span.fancytree-node",
    menu: [],
    beforeOpen: function (event, ui) {
      console.log("here");
      var node = $.ui.fancytree.getNode(ui.target);
      var menu = undefined;
      if (node.key == "master") {
        menu = MENU_MASTER;
      } else if (node.key.startsWith("project_")) {
        menu = MENU_PROJECT;
      } else if (node.key.startsWith("file_")) {
        menu = MENU_FILE;
      } else {
        menu = MENU_SIGNAL;
      }
      node.setActive();
      $("#tree").contextmenu({ menu });
    },
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

watch(props["data"], async (newData, oldData) => {
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

        <Input v-model="dialogInput" class="mb-8" />

        <div class="mt-2 flex justify-end gap-5">
          <DialogClose>
            <button
              class="rounded-md bg-red-500 px-2 py-1 text-white font-bold"
            >
              <i class="bi-check-lg font-bold mr-1"></i>Ок
            </button>
          </DialogClose>
          <DialogClose>
            <button
              @click="dialogConfirm"
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
