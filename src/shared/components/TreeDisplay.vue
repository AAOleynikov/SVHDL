<script setup lang="ts">
/**
- data - непосредственно данные. Один элемент класса TreeData
- getMenu - функция, принимающая ключ элемента и возвращающая список возможных действий.
 Также в каждом действии должны быть иконка и колбэк. В списке может быть также строка "---", которая является разделителем меню.
 */

import { onMounted, watch } from "vue";
import { JQueryUIIcon } from "./jqueryuiicons"; // Иконки из jquery-ui

// @ts-expect-error: легаси JQuery
import $ from "jquery";
import "jquery-ui/themes/base/all.css";
import "jquery-ui/dist/jquery-ui";
import "ui-contextmenu/jquery.ui-contextmenu.min";
import "jquery.fancytree/dist/skin-lion/ui.fancytree.less";
import "jquery.fancytree/dist/modules/jquery.fancytree.edit";
import "jquery.fancytree/dist/modules/jquery.fancytree.filter";
// @ts-expect-error: легаси модуль
import { createTree } from "jquery.fancytree";

export type IKey = {
  type: "architecture" | "entity" | "file" | "project" | "storage";
  assocObj?: unknown;
};

export type Callback = (key: IKey) => void;

export interface TreeData {
  title: string;
  icon?: string;
  badges?: string[];
  isBold?: boolean;
  key: unknown;
  children?: TreeData[];
}

export interface MenuAction {
  callback?: Callback;
  text: string;
  icon?: JQueryUIIcon;
}

export type GetMenuFunction = (key: IKey) => (MenuAction | "---")[];

type InternalTreeElem = {
  title: string;
  icon: string | undefined;
  folder: boolean;
  key: string;
  children?: InternalTreeElem[];
  expanded?: boolean;
};

type InternalMenuAction = {
  title: string;
  cmd?: string;
  uiIcon?: JQueryUIIcon;
};

let realTree: InternalTreeElem[] = []; // Значение дерева

let keyMap: Map<number, any> = new Map();
let callbackMap: Map<number, Callback> = new Map();

let tree: any = undefined;

const props = defineProps<{
  data: TreeData;
  getMenuFunction: GetMenuFunction;
  selectCallback: Callback;
}>();

watch(
  () => props.data,
  () => {
    fullyReloadTree();
  }
);

/** Рекурсивно загрузить данные в представление дерева */
function loadTreeInternal(data: TreeData, loadTo: InternalTreeElem[]) {
  keyMap.set(keyMap.size, data.key);
  const newData: InternalTreeElem = {
    title:
      (data.badges != undefined && data.badges.length
        ? data.badges
            .map((badge) => {
              return `<i class="${badge}"></i>`;
            })
            .join(" ") + " "
        : "") +
      (data.isBold ? "<b>" : "") +
      data.title +
      (data.isBold ? "</b>" : ""),
    icon: data.icon,
    folder: false,
    key: (keyMap.size - 1).toString(),
  };
  if (data.children != undefined && data.children.length) {
    newData.folder = true;
    newData.expanded = true;
    newData.children = [];
    for (const child of data.children) {
      loadTreeInternal(child, newData.children);
    }
  }
  loadTo.push(newData);
}

function fullyReloadTree() {
  realTree = [];
  keyMap = new Map();
  loadTreeInternal(props.data, realTree);

  if (tree !== undefined) {
    tree.reload();
  }
}

// Запустить fullyReloadTree при создании дерева
fullyReloadTree();

// Обработка нажатия пользователем пункта в контекстном меню
const menuEvent = (event: any, data: { cmd: string }) => {
  const command = data.cmd;
  const callback = callbackMap.get(parseInt(command));
  if (callback === undefined) {
    throw new Error("Callback is undefined");
  }
  const node = tree.getActiveNode();
  const keyRaw = node.key;
  const keyReal = keyMap.get(parseInt(keyRaw));
  callback(keyReal);
};

// Функция выбирает меню, которое будет открываться при ПКМ на элемент дерева
const chooseMenuForElement = (event: any, ui: { target: any }) => {
  const node = $.ui.fancytree.getNode(ui.target);
  node.setActive();
  const keyRaw = node.key;
  const keyReal = keyMap.get(parseInt(keyRaw));
  const menu: (MenuAction | "---")[] = props.getMenuFunction(keyReal);

  callbackMap = new Map();
  const normalMenu: InternalMenuAction[] = [];
  for (const menuItem of menu) {
    if (menuItem === "---") normalMenu.push({ title: "----" });
    else {
      const callbackId = callbackMap.size;
      if (menuItem.callback) {
        callbackMap.set(callbackId, menuItem.callback);
      }
      normalMenu.push({
        title: menuItem.text,
        cmd: callbackId.toString(),
        uiIcon: menuItem.icon,
      });
    }
  }
  $("#tree").contextmenu({ menu: normalMenu });
};

// При выборе элемента дерева
const onSelectTreeElement = (event: any, data: { node: { key: any } }) => {
  const keyRaw = data.node.key;
  const keyReal = keyMap.get(parseInt(keyRaw));
  props.selectCallback(keyReal);
};

// Когда компонент Vue смонтирован, замутить дерево
onMounted(() => {
  tree = createTree("#tree", {
    selectMode: 3,
    source: () => {
      return realTree;
    },
    click: onSelectTreeElement,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  +$("#tree").on("nodeCommand", menuEvent);
  // @ts-expect-error: легаси
  import("jquery.fancytree/dist/skin-win7/ui.fancytree.css");

  $("#tree").contextmenu({
    delegate: "span.fancytree-node",
    menu: [],
    beforeOpen: chooseMenuForElement,
    select: function (event: any, ui: { cmd: string }) {
      // delay the event, so the menu can close and the click event does
      // not interfere with the edit control
      setTimeout(() => {
        $(this).trigger("nodeCommand", { cmd: ui.cmd });
      }, 100);
    },
  });
});
</script>

<template>
  <div>
    <div id="tree" style="height: 100%"></div>
  </div>
</template>
