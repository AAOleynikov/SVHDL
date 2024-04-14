<script setup>
import { ref, defineProps, defineEmits } from "vue";

const points = [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0];
let pointsWithX = [];
for (let i = 0; i < points.length; i++) {
  pointsWithX.push([40 * i, 20 * points[i] + 3]);
}
let pointPairs = [];
for (let i = 0; i < points.length - 1; i++) {
  pointPairs.push([pointsWithX[i], pointsWithX[i + 1]]);
}
</script>

<template>
  <div class="h-8">
    <svg>
      <line
        v-for="point of pointPairs"
        :x1="point[0][0]"
        :y1="point[0][1]"
        :x2="point[1][0]"
        :y2="point[1][1]"
        stroke="black"
      />
    </svg>
  </div>
</template>

<style scoped></style>
