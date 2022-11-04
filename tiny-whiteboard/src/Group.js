import { v4 as uuidv4 } from 'uuid'
import MultiSelectElement from './elements/MultiSelectElement'

// 编组/取消编组类
export default class Group {
  constructor(app) {
    this.app = app
    this.groupIdToElementList = {}
    this.newGroupIdMap = {}
  }

  // 多选时渲染编组元素的多选框
  render() {
    Object.keys(this.groupIdToElementList).forEach(groupId => {
      let group = this.groupIdToElementList[groupId]
      let selected = group[0].isSelected
      if (selected) {
        let mElement = new MultiSelectElement(
          {
            type: 'multiSelectElement'
          },
          this.app
        )
        mElement.setSelectedElementList(group)
        mElement.updateRect()
        mElement.dragElement.onlyShowBody()
        mElement.render()
      }
    })
  }

  // 存储到映射列表
  setToMap(element) {
    let groupId = element.getGroupId()
    if (groupId) {
      if (!this.groupIdToElementList[groupId]) {
        this.groupIdToElementList[groupId] = []
      }
      this.groupIdToElementList[groupId].push(element)
    }
  }

  // 初始化映射列表
  initIdToElementList(elementList) {
    this.groupIdToElementList = {}
    elementList.forEach(element => {
      this.setToMap(element)
    })
  }

  // 处理元素数据的复制
  handleCopyElementData(data) {
    if (data.groupId) {
      if (this.newGroupIdMap[data.groupId]) {
        data.groupId = this.newGroupIdMap[data.groupId]
      } else {
        data.groupId = this.newGroupIdMap[data.groupId] = uuidv4()
      }
    }
    return data
  }

  // 复位用于元素数据复制的存储对象
  clearCopyMap() {
    this.newGroupIdMap = {}
  }

  // 处理元素对象的复制
  handleCopyElement(element) {
    this.setToMap(element)
  }

  // 编组
  dogroup() {
    if (
      !this.app.selection.hasSelection ||
      this.app.selection.multiSelectElement.selectedElementList.length <= 1
    ) {
      return
    }
    let groupElement = this.app.selection.multiSelectElement.selectedElementList
    let groupId = uuidv4()
    this.groupIdToElementList[groupId] = groupElement
    groupElement.forEach(element => {
      element.setGroupId(groupId)
    })
    this.app.render.render()
    this.app.emitChange()
  }

  // 取消编组
  ungroup() {
    if (
      !this.app.selection.hasSelection ||
      this.app.selection.multiSelectElement.selectedElementList.length <= 1
    ) {
      return
    }
    let groupElement = this.app.selection.multiSelectElement.selectedElementList
    let groupId = groupElement[0].getGroupId()
    this.groupIdToElementList[groupId] = []
    delete this.groupIdToElementList[groupId]
    groupElement.forEach(element => {
      element.removeGroupId(groupId)
    })
    this.app.render.render()
    this.app.emitChange()
  }

  // 根据元素激活元素所在的组
  setSelection(element) {
    let groupId = element.getGroupId()
    if (this.groupIdToElementList[groupId]) {
      this.app.selection.selectElements(this.groupIdToElementList[groupId])
    }
  }

  // 获取和指定元素同一个组的所有元素
  getGroupElements(element) {
    let groupId = element.getGroupId()
    return this.groupIdToElementList[groupId] || []
  }
}
