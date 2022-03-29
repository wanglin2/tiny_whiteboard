<template>
  <div class="container">
    <div class="toolbar">
      <el-radio-group v-model="currentType">
        <el-radio-button label="selection">选择</el-radio-button>
        <el-radio-button label="rectangle">矩形</el-radio-button>
      </el-radio-group>
    </div>
    <div class="canvasBox" ref="box">
      <canvas class="canvas" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import App from "./App.js";

// 当前操作类型
const currentType = ref("selection");
// dom节点
const box = ref(null);
const canvas = ref(null);
// 应用实例
const app = new App();

// dom元素挂载完成
onMounted(() => {
  app.init(box.value, canvas.value, currentType);
});
</script>

<style lang="less" scoped>
.container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  .toolbar {
    position: absolute;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    z-index: 2;
  }

  .canvasBox {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
