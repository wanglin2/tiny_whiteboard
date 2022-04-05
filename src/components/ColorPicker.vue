<template>
    <div class="colorPickerContainer">
        <div class="content">
            <el-popover
                placement="bottom"
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
                    ></div>
                </div>
            </el-popover>
            <el-input v-model="color">
                <template #prepend>颜色</template>
            </el-input>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { strokeColorList, fillColorList } from '../constants';

const props = defineProps({
    value: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    }
})

const emits = defineEmits(['change'])

const color = ref(props.value)
watch(() => {
    return props.value;
}, (val) => {
    color.value = val
})
const colorList = computed(() => {
    switch (props.type) {
        case 'stroke':
            return strokeColorList;
        case 'fill':
            return fillColorList;
        default:
            return [];
    }
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
    }
}
</style>