<template>
  <div class="container">
    <div class="toolbar">
      <el-radio-group v-model="currentType" @change="onCurrentTypeChange">
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
import { onMounted, ref, watch } from "vue";
import App from "./App.js";

// 当前操作类型
const currentType = ref("selection");

// dom节点
const box = ref(null);
const canvas = ref(null);

// 应用实例
const app = new App();

watch(currentType, () => {
  app.updateCurrentType(currentType.value);
});

app.on("currentTypeChange", (type) => {
  currentType.value = type;
});

const onCurrentTypeChange = () => {
  app.clearActive();
};

// dom元素挂载完成
onMounted(() => {
  app.init(box.value, canvas.value, currentType.value);
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
