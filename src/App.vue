<template>
  <div class="container">
    <div class="toolbar">
      <el-radio-group v-model="currentType" @change="onCurrentTypeChange">
        <el-radio-button label="selection">选择</el-radio-button>
        <el-radio-button label="rectangle">矩形</el-radio-button>
        <el-radio-button label="diamond">菱形</el-radio-button>
        <el-radio-button label="triangle">三角形</el-radio-button>
        <el-radio-button label="circle">圆形</el-radio-button>
        <el-radio-button label="line">线段</el-radio-button>
        <el-radio-button label="arrow">箭头</el-radio-button>
        <el-radio-button label="freedraw">自由画笔</el-radio-button>
        <el-radio-button label="text">文字</el-radio-button>
        <el-radio-button label="image">图片</el-radio-button>
      </el-radio-group>
    </div>
    <div class="canvasBox" ref="box"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import App from "./package/App.js";

// 当前操作类型
const currentType = ref("selection");

// dom节点
const box = ref(null);

// 应用实例
const app = new App();

// 通知app更当前类型
watch(currentType, () => {
  app.updateCurrentType(currentType.value);
});

// 监听app内部修改类型事件
app.on("currentTypeChange", (type) => {
  currentType.value = type;
});

const onCurrentTypeChange = () => {
  // 清除激活项
  app.clearActive();
};

// dom元素挂载完成
onMounted(() => {
  app.init(box.value, currentType.value);
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
    width: 100%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    justify-content: center;
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
