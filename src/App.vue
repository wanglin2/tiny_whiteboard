<template>
  <div class="container">
    <div class="canvasBox" ref="box"></div>
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
    <Transition>
      <div class="sidebar" v-show="activeElement">
        <div class="elementStyle">
          <!-- 描边 -->
          <div
            class="styleBlock"
            v-if="!['text', 'image'].includes(activeElement?.type)"
          >
            <div class="styleBlockTitle">描边</div>
            <div class="styleBlockContent">
              <ColorPicker
                type="stroke"
                :value="activeElement?.style.strokeStyle"
                @change="updateStyle('strokeStyle', $event)"
              ></ColorPicker>
            </div>
          </div>
          <!-- 填充 -->
          <div
            class="styleBlock"
            v-if="
              !['image', 'line', 'arrow', 'freedraw'].includes(
                activeElement?.type
              )
            "
          >
            <div class="styleBlockTitle">填充</div>
            <div class="styleBlockContent">
              <ColorPicker
                type="fill"
                :value="activeElement?.style.fillStyle"
                @change="updateStyle('fillStyle', $event)"
              ></ColorPicker>
            </div>
          </div>
          <!-- 描边宽度 -->
          <div
            class="styleBlock"
            v-if="!['image'].includes(activeElement?.type)"
          >
            <div class="styleBlockTitle">描边宽度</div>
            <div class="styleBlockContent">
              <el-radio-group
                v-model="lineWidth"
                @change="updateStyle('lineWidth', $event)"
              >
                <el-radio-button label="small">
                  <div class="lineWidthItem small">
                    <div class="bar"></div>
                  </div>
                </el-radio-button>
                <el-radio-button label="middle">
                  <div class="lineWidthItem middle">
                    <div class="bar"></div>
                  </div>
                </el-radio-button>
                <el-radio-button label="large">
                  <div class="lineWidthItem large">
                    <div class="bar"></div>
                  </div>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <!-- 边框样式 -->
          <div
            class="styleBlock"
            v-if="!['freedraw', 'image'].includes(activeElement?.type)"
          >
            <div class="styleBlockTitle">边框样式</div>
            <div class="styleBlockContent">
              <el-radio-group
                v-model="lineDash"
                @change="updateStyle('lineDash', $event)"
              >
                <el-radio-button :label="0">
                  <div>实线</div>
                </el-radio-button>
                <el-radio-button :label="5">
                  <div>大虚线</div>
                </el-radio-button>
                <el-radio-button :label="2">
                  <div>小虚线</div>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <!-- 透明度 -->
          <div class="styleBlock">
            <div class="styleBlockTitle">透明度</div>
            <div class="styleBlockContent">
              <el-slider
                v-model="globalAlpha"
                :min="0"
                :max="1"
                :step="0.1"
                @change="updateStyle('globalAlpha', $event)"
              />
            </div>
          </div>
          <!-- 操作 -->
          <div class="styleBlock">
            <div class="styleBlockTitle">操作</div>
            <div class="styleBlockContent">
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="deleteElement"
              />
              <el-button
                type="primary"
                :icon="CopyDocument"
                circle
                @click="copyElement"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <div class="footerLeft">
      <div class="scaleBox">
        <el-button :icon="ZoomOut" circle @click="zoomOut" />
        <el-button :icon="ZoomIn" circle @click="zoomIn" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue";
import TinyWhiteboard from "./package";
import ColorPicker from "./components/ColorPicker.vue";
import { Delete, CopyDocument, ZoomIn, ZoomOut } from "@element-plus/icons-vue";

// 当前操作类型
const currentType = ref("selection");

// dom节点
const box = ref(null);

// 应用实例
let app = null;
// 当前激活的元素
const activeElement = ref(null);
let originActiveElement = null;
// 描边宽度
const lineWidth = ref("small");
// 边框样式
const lineDash = ref(0);
// 透明度
const globalAlpha = ref(1);

// 通知app更当前类型
watch(currentType, () => {
  app.updateCurrentType(currentType.value);
});

// 更新样式
const updateStyle = (key, value) => {
  app.setElementStyle({
    [key]: value,
  });
};

// 类型变化
const onCurrentTypeChange = () => {
  // 清除激活项
  app.clearActiveElements();
};

// 删除元素
const deleteElement = () => {
  app.deleteElement(originActiveElement);
};

// 复制元素
const copyElement = () => {
  app.copyElement(originActiveElement);
};

// 放大
const zoomIn = () => {
  app.zoomIn();
};

// 缩小
const zoomOut = () => {
  app.zoomOut();
};

// dom元素挂载完成
onMounted(() => {
  // 创建实例
  app = new TinyWhiteboard({
    container: box.value,
    drawType: currentType.value,
  });
  // 监听app内部修改类型事件
  app.on("currentTypeChange", (type) => {
    currentType.value = type;
  });
  // 监听元素激活事件
  app.on("activeElementChange", (element) => {
    element = element.length > 0 ? element[0] : null;
    activeElement.value = element;
    originActiveElement = element;
    if (element) {
      let { style } = element;
      lineWidth.value = style.lineWidth;
      lineDash.value = style.lineDash;
      globalAlpha.value = style.globalAlpha;
    }
  });
});
</script>

<style lang="less">
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(-300px);
}
</style>
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

  .sidebar {
    position: absolute;
    left: 10px;
    top: 10px;
    width: 250px;
    background-color: #fff;

    .elementStyle {
      padding: 10px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      border-radius: 4px;

      .styleBlock {
        margin-bottom: 10px;

        .styleBlockTitle {
          color: #343a40;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .styleBlockContent {
          .lineWidthItem {
            display: flex;
            width: 30px;
            height: 10px;
            align-items: center;

            .bar {
              width: 100%;
              background-color: #212529;
            }

            &.small {
              .bar {
                height: 2px;
              }
            }

            &.middle {
              .bar {
                height: 4px;
              }
            }

            &.large {
              .bar {
                height: 6px;
              }
            }
          }

          /deep/ .el-radio-group {
            .el-radio-button {
              &.is-active {
                .lineWidthItem {
                  .bar {
                    background-color: #fff;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .footerLeft {
    position: absolute;
    left: 10px;
    bottom: 10px;
    height: 40px;
    background-color: #fff;

    .scaleBox {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
  }
}
</style>
