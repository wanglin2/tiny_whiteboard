<template>
  <div class="colorPickerContainer">
    <div class="content">
      <el-popover
        :placement="placement"
        :width="200"
        trigger="click"
        :disabled="colorList.length <= 0"
      >
        <template #reference>
          <div class="colorPreview" :style="{ backgroundColor: color }"></div>
        </template>
        <div class="colorList">
          <div
            class="colorItem"
            v-for="item in colorList"
            :key="item"
            :style="{ backgroundColor: item }"
            @click="color = item"
          >
            <span v-if="!item">无</span>
            <span v-if="item === 'transparent'">透明</span>
          </div>
        </div>
      </el-popover>
      <el-input v-model="color">
        <template #prepend>{{ name }}</template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  strokeColorList,
  fillColorList,
  backgroundColorList
} from '../constants'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: '颜色'
  },
  placement: {
    type: String,
    default: 'bottom'
  },
  showEmptySelect: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['change'])

const color = ref(props.value)
watch(
  () => {
    return props.value
  },
  val => {
    color.value = val
  }
)
const colorList = computed(() => {
  let list = props.showEmptySelect ? [''] : []
  switch (props.type) {
    case 'stroke':
      list.push(...strokeColorList)
      break
    case 'fill':
      list.push(...fillColorList)
      break
    case 'background':
      list.push(...backgroundColorList)
      break
    default:
  }
  return list
})
watch(color, () => {
  emits('change', color.value)
})
</script>

<style lang="less" scoped>
.colorPickerContainer {
  .content {
    display: flex;
    align-items: center;

    .colorPreview {
      width: 30px;
      height: 30px;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      flex-shrink: 0;
      margin-right: 10px;
      overflow: hidden;
      cursor: pointer;
    }
  }
}

.colorList {
  display: grid;
  grid-template-columns: repeat(5, auto);
  grid-gap: 5px;
  .colorItem {
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #909399;
  }
}
</style>
