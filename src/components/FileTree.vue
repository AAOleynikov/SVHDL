<script setup>
import { onMounted, defineProps, reactive, watch } from "vue";
import $ from "jquery";
import "jquery-ui/themes/base/all.css";
import "jquery-ui/dist/jquery-ui";
import "ui-contextmenu/jquery.ui-contextmenu.min";
import "jquery.fancytree/dist/skin-lion/ui.fancytree.less";
import "jquery.fancytree/dist/modules/jquery.fancytree.edit";
import "jquery.fancytree/dist/modules/jquery.fancytree.filter";
import { createTree } from "jquery.fancytree";
import { Project } from "@/lib/projectSystem";

const props = defineProps(["data"]);
const emit = defineEmits(["update:data"]);
var tree = null;

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

const menuEvent = function (event, data) {
  console.log(data);
  console.log(event);
  const node = tree.getActiveNode();
  if (node.key == "master") {
    if (data.cmd == "create-project") {
      console.log("create-project");
      props.data.projects.createProject()
    }
    if (data.cmd == "delete-all-projects") {
      console.log("delete-all-projects");
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
