<template>
  <div
    class="contextmenuContainer"
    v-if="isShow"
    :style="{ left: left + 'px', top: top + 'px' }"
  >
    <template v-if="isHasActiveElements">
      <div
        class="item"
        :class="{ disabled: !canMoveLevel }"
        @click="exec('moveUp')"
      >
        上移一层
      </div>
      <div
        class="item"
        :class="{ disabled: !canMoveLevel }"
        @click="exec('moveDown')"
      >
        下移一层
      </div>
      <div
        class="item"
        :class="{ disabled: !canMoveLevel }"
        @click="exec('moveTop')"
      >
        置于顶层
      </div>
      <div
        class="item"
        :class="{ disabled: !canMoveLevel }"
        @click="exec('moveBottom')"
      >
        置于底层
      </div>
      <div class="splitLine"></div>
      <div class="item danger" @click="exec('del')">删除</div>
      <div class="item" @click="exec('copy')">复制</div>
      <div
        class="item"
        :class="{ disabled: groupStatus === 'disabled' }"
        @click="exec(groupStatus)"
      >
        {{ groupBtnText }}
      </div>
    </template>
    <template v-else>
      <div class="item" @click="exec('selectAll')">全部选中</div>
      <div class="item" @click="exec('backToCenter')">回到中心</div>
      <div class="item" @click="exec('fit')">显示全部</div>
      <div class="item" @click="exec('resetZoom')">重置缩放</div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  app: {
    type: Object
  }
})

const isShow = ref(false)
const left = ref(0)
const top = ref(0)
const isHasActiveElements = ref(false)
const canMoveLevel = ref(false)
const groupStatus = ref('disabled')
const groupBtnText = computed(() => {
  return {
    disabled: '编组',
    dogroup: '编组',
    ungroup: '取消编组'
  }[groupStatus.value]
})

const show = (e, activeElements) => {
  isHasActiveElements.value = activeElements.length > 0
  canMoveLevel.value = activeElements.length === 1
  left.value = e.clientX + 10
  top.value = e.clientY + 10
  isShow.value = true
  handleGroup(activeElements)
}

const handleGroup = activeElements => {
  let isGroup = true
  activeElements.forEach(item => {
    if (!item.hasGroup()) {
      isGroup = false
    }
  })
  if (isGroup) {
    groupStatus.value = 'ungroup'
  } else if (activeElements.length > 1) {
    groupStatus.value = 'dogroup'
  }
}

const hide = () => {
  isShow.value = false
  left.value = 0
  top.value = 0
}

props.app.on('contextmenu', show)

document.body.addEventListener('click', hide)

const exec = command => {
  switch (command) {
    case 'moveUp':
      props.app.moveUpCurrentElement()
      break
    case 'moveDown':
      props.app.moveDownCurrentElement()
      break
    case 'moveTop':
      props.app.moveTopCurrentElement()
      break
    case 'moveBottom':
      props.app.moveBottomCurrentElement()
      break
    case 'del':
      props.app.deleteCurrentElements()
      break
    case 'copy':
      props.app.copyPasteCurrentElements()
      break
    case 'selectAll':
      props.app.selectAll()
      break
    case 'backToCenter':
      props.app.scrollToCenter()
      break
    case 'fit':
      props.app.fit()
      break
    case 'resetZoom':
      props.app.setZoom(1)
    case 'dogroup':
      props.app.dogroup()
      break
    case 'ungroup':
      props.app.ungroup()
      break
    default:
      break
  }
}

// onMousedown(e) {
//       if (e.which !== 3) {
//         return;
//       }
//       this.mosuedownX = e.clientX;
//       this.mosuedownY = e.clientY;
//       this.isMousedown = true;
//     }
//     onMouseup(e) {
//       if (!this.isMousedown) {
//         return;
//       }
//       this.isMousedown = false;
//       if (
//         Math.abs(this.mosuedownX - e.clientX) > 3 ||
//         Math.abs(this.mosuedownY - e.clientY) > 3
//       ) {
//         this.hide();
//         return;
//       }
//       this.show2(e);
//     },
</script>

<style lang="less" scoped>
.contextmenuContainer {
  position: fixed;
  width: 161px;
  background: #fff;
  box-shadow: 0 4px 12px 0 hsla(0, 0%, 69%, 0.5);
  border-radius: 4px;
  padding-top: 16px;
  padding-bottom: 16px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #1a1a1a;

  .splitLine {
    height: 1px;
    background-color: #f5f5f5;
    margin: 5px 0;
  }

  .item {
    height: 28px;
    line-height: 28px;
    padding-left: 16px;
    cursor: pointer;
    &.danger {
      color: #f56c6c;
    }
    &:hover {
      background: #f5f5f5;
    }
    &.disabled {
      color: grey;
      cursor: not-allowed;
      &:hover {
        background: #fff;
      }
    }
  }
}
</style>
