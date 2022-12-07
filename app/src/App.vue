<template>
  <div class="container">
    <div class="canvasBox" ref="box"></div>
    <div class="toolbar" v-if="!readonly">
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
      <div class="sidebar" v-show="activeElement || hasSelectedElements">
        <div class="elementStyle">
          <!-- 描边 -->
          <div
            class="styleBlock"
            v-if="
              !['text', 'image'].includes(activeElement?.type) ||
              hasSelectedElements
            "
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
              ) || hasSelectedElements
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
          <!-- 字体 -->
          <div
            class="styleBlock"
            v-if="['text'].includes(activeElement?.type) || hasSelectedElements"
          >
            <div class="styleBlockTitle">字体</div>
            <div class="styleBlockContent">
              <el-select
                size="mini"
                v-model="fontFamily"
                placeholder="字体"
                @change="updateStyle('fontFamily', $event)"
              >
                <el-option
                  v-for="item in fontFamilyList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                  :style="{ fontFamily: item.value }"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <!-- 字号 -->
          <div
            class="styleBlock"
            v-if="['text'].includes(activeElement?.type) || hasSelectedElements"
          >
            <div class="styleBlockTitle">字号</div>
            <div class="styleBlockContent">
              <el-select
                size="mini"
                v-model="fontSize"
                placeholder="字号"
                @change="updateStyle('fontSize', $event)"
              >
                <el-option
                  v-for="item in fontSizeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                  :style="{ fontSize: item.value }"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <!-- 描边宽度 -->
          <div
            class="styleBlock"
            v-if="
              !['image', 'text'].includes(activeElement?.type) ||
              hasSelectedElements
            "
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
            v-if="
              !['freedraw', 'image', 'text'].includes(activeElement?.type) ||
              hasSelectedElements
            "
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
          <!-- 角度 -->
          <div class="styleBlock" v-if="!hasSelectedElements">
            <div class="styleBlockTitle">角度</div>
            <div class="styleBlockContent">
              <el-slider
                v-model="rotate"
                :min="0"
                :max="360"
                :step="1"
                @input="onRotateChange"
              />
              <el-input-number
                style="width: 80px; margin-left: 20px"
                :controls="false"
                v-model="rotate"
                :min="0"
                :max="360"
                @focus="onInputNumberFocus"
                @blur="onInputNumberBlur"
                @change="onRotateChange"
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
    <div class="footerLeft" @click.stop>
      <!-- 缩放 -->
      <div class="blockBox">
        <el-tooltip effect="light" content="缩小" placement="top">
          <el-button :icon="ZoomOut" circle @click="zoomOut" />
        </el-tooltip>
        <el-tooltip effect="light" content="重置缩放" placement="top">
          <span class="zoom" @click="resetZoom">{{ currentZoom }}%</span>
        </el-tooltip>
        <el-tooltip effect="light" content="放大" placement="top">
          <el-button :icon="ZoomIn" circle @click="zoomIn" />
        </el-tooltip>
      </div>
      <!-- 前进回退 -->
      <div class="blockBox" v-if="!readonly">
        <el-tooltip effect="light" content="回退" placement="top">
          <el-button
            :icon="RefreshLeft"
            circle
            :disabled="!canUndo"
            @click="undo"
          />
        </el-tooltip>
        <el-tooltip effect="light" content="前进" placement="top">
          <el-button
            :icon="RefreshRight"
            circle
            :disabled="!canRedo"
            @click="redo"
          />
        </el-tooltip>
      </div>
      <!-- 滚动 -->
      <div class="blockBox">
        <el-tooltip effect="light" content="滚动至中心" placement="top">
          <el-button @click="scrollToCenter"
            >X:{{ scroll.x }} Y:{{ scroll.y }}
          </el-button>
        </el-tooltip>
      </div>
      <!-- 橡皮擦、显示网格、清空 -->
      <div class="blockBox">
        <!-- 橡皮擦 -->
        <el-tooltip
          effect="light"
          :content="currentType === 'eraser' ? '关闭橡皮擦' : '橡皮擦'"
          placement="top"
        >
          <el-button
            v-if="!readonly"
            :icon="Remove"
            circle
            :type="currentType === 'eraser' ? 'primary' : null"
            @click="toggleEraser"
          />
        </el-tooltip>
        <!-- 网格 -->
        <el-tooltip
          effect="light"
          :content="showGrid ? '隐藏网格' : '显示网格'"
          placement="top"
        >
          <el-button
            :icon="Grid"
            circle
            :type="showGrid ? 'primary' : null"
            @click="toggleGrid"
          />
        </el-tooltip>
        <!-- 只读、编辑模式切换 -->
        <el-tooltip
          effect="light"
          :content="readonly ? '切换到编辑模式' : '切换到只读模式'"
          placement="top"
        >
          <el-button
            :icon="readonly ? View : Edit"
            circle
            @click="toggleMode"
          />
        </el-tooltip>
        <!-- 清空 -->
        <el-tooltip effect="light" content="清空" placement="top">
          <el-button v-if="!readonly" :icon="Delete" circle @click="empty" />
        </el-tooltip>
      </div>
      <!-- 导入导出 -->
      <div class="blockBox">
        <el-tooltip effect="light" content="从json文件导入" placement="top">
          <el-button
            v-if="!readonly"
            :icon="Upload"
            circle
            style="margin-right: 10px"
            @click="importFromJson"
          />
        </el-tooltip>
        <el-dropdown @command="handleExportCommand">
          <span class="el-dropdown-link">
            <el-button :icon="Download" circle />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="png">导出为图片</el-dropdown-item>
              <el-dropdown-item command="json">导出为json</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <!-- 背景 -->
      <div class="blockBox">
        <ColorPicker
          style="width: 280px"
          type="background"
          :value="backgroundColor"
          :showEmptySelect="true"
          placement="top"
          name="背景颜色"
          @change="setBackgroundColor"
        ></ColorPicker>
      </div>
      <!-- 帮助 -->
      <div class="blockBox">
        <el-tooltip effect="light" content="帮助" placement="top">
          <el-button
            :icon="QuestionFilled"
            circle
            style="margin-right: 10px"
            @click="helpDialogVisible = !helpDialogVisible"
          />
        </el-tooltip>
      </div>
    </div>
    <!-- 导出图片弹窗 -->
    <el-dialog
      v-model="exportImageDialogVisible"
      title="导出为图片"
      :width="800"
    >
      <div class="exportImageContainer">
        <div class="imagePreviewBox">
          <img :src="exportImageUrl" alt="" />
        </div>
        <div class="handleBox">
          <el-checkbox
            v-model="exportOnlySelected"
            label="仅导出被选中"
            size="large"
            @change="reRenderExportImage"
            style="margin-right: 10px"
          />
          <el-checkbox
            v-model="exportRenderBackground"
            label="背景"
            size="large"
            @change="reRenderExportImage"
            style="margin-right: 10px"
          />
          <el-input
            v-model="exportFileName"
            style="width: 150px; margin-right: 10px"
          ></el-input>
          <el-input-number
            v-model="exportImagePaddingX"
            :min="10"
            :max="100"
            :step="5"
            controls-position="right"
            @change="reRenderExportImage"
            style="margin-right: 10px"
          />
          <el-input-number
            v-model="exportImagePaddingY"
            :min="10"
            :max="100"
            :step="5"
            controls-position="right"
            @change="reRenderExportImage"
            style="margin-right: 10px"
          />
          <el-button type="primary" @click="downloadExportImage"
            >下载</el-button
          >
        </div>
      </div>
    </el-dialog>
    <!-- 导出json弹窗 -->
    <el-dialog
      v-model="exportJsonDialogVisible"
      title="导出为json"
      :width="800"
    >
      <div class="exportJsonContainer">
        <div class="jsonPreviewBox" ref="jsonPreviewBox"></div>
        <div class="handleBox">
          <el-input
            v-model="exportFileName"
            style="width: 150px; margin-right: 10px"
          ></el-input>
          <el-button type="primary" @click="downloadExportJson">下载</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 帮助弹窗 -->
    <el-dialog v-model="helpDialogVisible" title="帮助" :width="500">
      <div class="helpDialogContent">
        <h2>获取源码</h2>
        <p>
          github：<a
            style="color: #409eff"
            href="https://github.com/wanglin2/tiny_whiteboard"
            target="_blank"
            >https://github.com/wanglin2/tiny_whiteboard</a
          >
        </p>
        <h2>tips</h2>
        <p>移动画布：按住空格键进行拖动</p>
        <h2>快捷键</h2>
        <el-table :data="shortcutKeyList">
          <el-table-column property="name" label="操作" />
          <el-table-column property="value" label="快捷键" />
        </el-table>
      </div>
    </el-dialog>
    <!-- 右键菜单 -->
    <Contextmenu v-if="appInstance" :app="appInstance"></Contextmenu>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, toRaw, nextTick, computed, reactive } from 'vue'
import TinyWhiteboard from 'tiny-whiteboard'
import ColorPicker from './components/ColorPicker.vue'
import {
  Delete,
  CopyDocument,
  ZoomIn,
  ZoomOut,
  Remove,
  RefreshLeft,
  RefreshRight,
  Download,
  Upload,
  CaretTop,
  CaretBottom,
  Minus,
  Grid,
  View,
  Edit,
  QuestionFilled
} from '@element-plus/icons-vue'
import Contextmenu from './components/Contextmenu.vue'
import { fontFamilyList, fontSizeList } from './constants'

// 当前操作类型
const currentType = ref('selection')

// dom节点
const box = ref(null)

// 应用实例
let app = null
const appInstance = ref(null)
// 当前激活的元素
const activeElement = ref(null)
// 当前多选的元素
const selectedElements = ref([])
const hasSelectedElements = computed(() => {
  return selectedElements.value.length > 0
})
// 描边宽度
const lineWidth = ref('small')
// 字体
const fontFamily = ref('微软雅黑, Microsoft YaHei')
// 字号
const fontSize = ref(18)
// 边框样式
const lineDash = ref(0)
// 透明度
const globalAlpha = ref(1)
// 角度
const rotate = ref(0)
// 当前缩放
const currentZoom = ref(100)
// 缩放允许前进后退
const canUndo = ref(false)
const canRedo = ref(false)
// 图片导出弹窗
const exportImageDialogVisible = ref(false)
const exportImageUrl = ref('')
const exportOnlySelected = ref(false)
const exportRenderBackground = ref(true)
const exportFileName = ref('未命名')
const exportImagePaddingX = ref(10)
const exportImagePaddingY = ref(10)
// json导出弹窗
const exportJsonDialogVisible = ref(false)
const exportJsonData = ref('')
const tree = ref(null)
const jsonPreviewBox = ref(null)
// 背景颜色
const backgroundColor = ref('')
// 当前滚动距离
const scroll = reactive({
  x: 0,
  y: 0
})
// 切换显示网格
const showGrid = ref(false)
// 模式切换
const readonly = ref(false)
// 帮助弹窗
const helpDialogVisible = ref(false)
const shortcutKeyList = reactive([
  {
    name: '全部选中',
    value: 'Control + a'
  },
  {
    name: '删除',
    value: 'Del 或 Backspace'
  },
  {
    name: '复制',
    value: 'Control + c'
  },
  {
    name: '粘贴',
    value: 'Control + v'
  },
  {
    name: '放大',
    value: 'Control + +'
  },
  {
    name: '缩小',
    value: 'Control + -'
  },
  {
    name: '重置缩放',
    value: 'Control + 0'
  },
  {
    name: '缩放以适应所有元素',
    value: 'Shift + 1'
  },
  {
    name: '撤销',
    value: 'Control + z'
  },
  {
    name: '重做',
    value: 'Control + y'
  },
  {
    name: '显示隐藏网格',
    value: "Control + '"
  }
])

// 通知app更当前类型
watch(currentType, () => {
  app.updateCurrentType(currentType.value)
})

// 元素角度变化
const onElementRotateChange = elementRotate => {
  rotate.value = elementRotate
}

// 修改元素角度
const onRotateChange = rotate => {
  app.updateActiveElementRotate(rotate)
}

// 数字输入框聚焦事件
const onInputNumberFocus = () => {
  // 解绑快捷键按键事件，防止冲突
  app.keyCommand.unBindEvent()
}

// 数字输入框失焦事件
const onInputNumberBlur = () => {
  // 重新绑定快捷键按键事件
  app.keyCommand.bindEvent()
}

// 更新样式
const updateStyle = (key, value) => {
  app.setCurrentElementsStyle({
    [key]: value
  })
}

// 类型变化
const onCurrentTypeChange = () => {
  // 清除激活项
  app.cancelActiveElement()
}

// 删除元素
const deleteElement = () => {
  app.deleteCurrentElements()
}

// 复制元素
const copyElement = () => {
  app.copyPasteCurrentElements()
}

// 放大
const zoomIn = () => {
  app.zoomIn()
}

// 缩小
const zoomOut = () => {
  app.zoomOut()
}

// 恢复初始缩放
const resetZoom = () => {
  app.setZoom(1)
}

// 橡皮擦
const toggleEraser = () => {
  currentType.value = currentType.value === 'eraser' ? 'selection' : 'eraser'
}

// 回退
const undo = () => {
  app.undo()
}

// 前进
const redo = () => {
  app.redo()
}

// 清空
const empty = () => {
  app.empty()
}

// 导入
const importFromJson = () => {
  let el = document.createElement('input')
  el.type = 'file'
  el.accept = 'application/json'
  el.addEventListener('input', () => {
    let reader = new FileReader()
    reader.onload = () => {
      el.value = null
      if (reader.result) {
        app.setData(JSON.parse(reader.result))
      }
    }
    reader.readAsText(el.files[0])
  })
  el.click()
}

// 导出
const handleExportCommand = type => {
  if (type === 'png') {
    exportImageUrl.value = app.exportImage({
      renderBg: exportRenderBackground.value,
      paddingX: exportImagePaddingX.value,
      paddingY: exportImagePaddingY.value,
      onlySelected: exportOnlySelected.value
    })
    exportImageDialogVisible.value = true
  } else if (type === 'json') {
    exportJsonData.value = app.exportJson()
    exportJsonDialogVisible.value = true
    nextTick(() => {
      if (!tree.value) {
        tree.value = jsonTree.create(exportJsonData.value, jsonPreviewBox.value)
      } else {
        tree.value.loadData(exportJsonData.value)
      }
    })
  }
}

// 重新生成导出图片
const reRenderExportImage = () => {
  exportImageUrl.value = app.exportImage({
    renderBg: exportRenderBackground.value,
    paddingX: exportImagePaddingX.value,
    paddingY: exportImagePaddingY.value,
    onlySelected: exportOnlySelected.value
  })
}

// 下载导出的图片
const downloadExportImage = () => {
  TinyWhiteboard.utils.downloadFile(
    exportImageUrl.value,
    exportFileName.value + '.png'
  )
}

// 下载导出的json
const downloadExportJson = () => {
  let str = JSON.stringify(exportJsonData.value, null, 4)
  let blob = new Blob([str])
  TinyWhiteboard.utils.downloadFile(
    URL.createObjectURL(blob),
    exportFileName.value + '.json'
  )
}

// 更新背景颜色
const setBackgroundColor = value => {
  app.setBackgroundColor(value)
}

// 滚动至中心
const scrollToCenter = () => {
  app.scrollToCenter()
}

// 切换显示网格
const toggleGrid = () => {
  if (showGrid.value) {
    showGrid.value = false
    app.hideGrid()
  } else {
    showGrid.value = true
    app.showGrid()
  }
}

// 模式切换
const toggleMode = () => {
  if (readonly.value) {
    readonly.value = false
    app.setEditMode()
  } else {
    readonly.value = true
    app.setReadonlyMode()
  }
}

// dom元素挂载完成
onMounted(() => {
  // 创建实例
  app = new TinyWhiteboard({
    container: box.value,
    drawType: currentType.value,
    state: {
      // backgroundColor: '#121212',
      // strokeStyle: '#fff',
      // fontFamily: '楷体, 楷体_GB2312, SimKai, STKaiti',
      // dragStrokeStyle: '#999'
    }
  })
  let storeData = localStorage.getItem('TINY_WHITEBOARD_DATA')
  if (storeData) {
    storeData = JSON.parse(storeData)
    ;[['backgroundColor', ''],['strokeStyle', '#000000'],['fontFamily', '微软雅黑, Microsoft YaHei'],['dragStrokeStyle', '#666'], ['fillStyle', 'transparent'], ['fontSize', 18]].forEach((item) => {
      if (storeData.state[item[0]] === undefined) {
        storeData.state[item[0]] = item[1]
      }
    })
    currentZoom.value = parseInt(storeData.state.scale * 100)
    scroll.x = parseInt(storeData.state.scrollX)
    scroll.y = parseInt(storeData.state.scrollY)
    showGrid.value = storeData.state.showGrid
    readonly.value = storeData.state.readonly
    app.setData(storeData)
  }
  // 监听app内部修改类型事件
  app.on('currentTypeChange', type => {
    currentType.value = type
  })
  // 监听元素激活事件
  app.on('activeElementChange', element => {
    if (activeElement.value) {
      activeElement.value.off('elementRotateChange', onElementRotateChange)
    }
    activeElement.value = element
    if (element) {
      let { style, rotate: elementRotate } = element
      lineWidth.value = style.lineWidth
      fontFamily.value = style.fontFamily
      fontSize.value = style.fontSize
      lineDash.value = style.lineDash
      globalAlpha.value = style.globalAlpha
      rotate.value = elementRotate
      element.on('elementRotateChange', onElementRotateChange)
    }
  })
  // 元素多选变化
  app.on('multiSelectChange', elements => {
    selectedElements.value = elements
  })
  // 缩放变化
  app.on('zoomChange', scale => {
    currentZoom.value = parseInt(scale * 100)
  })
  // 监听前进后退事件
  app.on('shuttle', (index, length) => {
    canUndo.value = index > 0
    canRedo.value = index < length - 1
  })
  // 监听数据变化
  app.on('change', data => {
    showGrid.value = data.state.showGrid
    localStorage.setItem('TINY_WHITEBOARD_DATA', JSON.stringify(data))
  })
  // 监听滚动变化
  app.on('scrollChange', (x, y) => {
    scroll.y = parseInt(y)
    scroll.x = parseInt(x)
  })
  appInstance.value = app
  // 窗口尺寸变化
  let resizeTimer = null
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      app.resize()
    }, 300)
  })
})
</script>

<style lang="less">
ul,
ol {
  list-style: none;
}
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
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    justify-content: center;
  }

  .canvasBox {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    background-color: #fff;
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
          display: flex;

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
    display: flex;
    align-items: center;

    .blockBox {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 10px;

      .zoom {
        width: 40px;
        margin: 0 10px;
        user-select: none;
        color: #606266;
        cursor: pointer;
        height: 32px;
        display: flex;
        align-items: center;
        background-color: #fff;
        border-radius: 5px;
        padding: 0 5px;
        justify-content: center;
      }
    }
  }
}

.exportImageContainer {
  .imagePreviewBox {
    height: 400px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')
      0;
    padding: 10px;

    img {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
    }
  }

  .handleBox {
    display: flex;
    align-items: center;
    height: 50px;
    justify-content: center;
  }
}

.exportJsonContainer {
  .jsonPreviewBox {
    height: 400px;
    overflow: auto;
    background-color: #f5f5f5;
    font-size: 14px;
    color: #000;

    /deep/ .jsontree_tree {
      font-family: 'Trebuchet MS', Arial, sans-serif !important;
    }
  }

  .handleBox {
    display: flex;
    align-items: center;
    height: 50px;
    justify-content: center;
  }
}

.helpDialogContent {
  height: 500px;
  overflow: auto;
}
</style>
