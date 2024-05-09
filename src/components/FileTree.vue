<script setup>
import { onMounted, defineProps, reactive, watch } from "vue";
import $ from "jquery";

import "jquery.fancytree/dist/skin-lion/ui.fancytree.less";
import "jquery.fancytree/dist/modules/jquery.fancytree.edit";
import "jquery.fancytree/dist/modules/jquery.fancytree.filter";

import { createTree } from "jquery.fancytree";

const props = defineProps(["data"]);
const emit = defineEmits(["update:data"]);
var tree = null;

let realTree = reactive([]);
if (props.data) {
  console.log("props data", props.data);
  for (let proj of props.data.projects) {
    console.log(proj);
  }
}

onMounted(() => {
  tree = createTree("#tree", {
    selectMode: 3,
    source: function (event, data) {
      return realTree
    },

    activate: function (event, data) {
      $("#statusLine").text(event.type + ": " + data.node);
    },
    select: function (event, data) {
      $("#statusLine").text(
        event.type + ": " + data.node.isSelected() + " " + data.node
      );
    },
  });
  import("jquery.fancytree/dist/skin-win7/ui.fancytree.css");
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
