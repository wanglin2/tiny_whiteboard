[TOC]

# 一个在线小白板

- [x] 支持绘制矩形、菱形、三角形、圆形、线段、箭头、自由画笔、文字、图片

- [x] 绘制的图形支持拖动、缩放、旋转

- [x] 支持垂直方向无限滚动，一块无限高度的白板

- [x] 支持放大缩小

- [x] 支持样式设置

- [x] 橡皮擦功能

- [x] 支持导入、导出

- [x] 支持前进回退

- [x] 本地存储

- [x] 滚动超出后支持一键回到内容

- [x] 支持多选

- [x] 支持网格模式

- [x] 支持只读模式，只读模式支持随意拖拽

- [ ] 小地图

- [ ] 支持快捷键

- [ ] 优化：非激活元素绘制到另一个canvas上

- [ ] 优化：超出视口的元素不进行绘制

# 目录简介

1.`/tiny-whiteboard`

在线白板工具库。

2.`/app`

使用`tiny-whiteboard`工具库，基于`vue3.x`、`ElementPlus`搭建的在线`demo`。

# 本地开发

开发

```bash
git clone https://github.com/wanglin2/tiny_whiteboard.git
cd tiny_whiteboard

cd tiny-whiteboard
npm i
npm link

cd ..
cd app
npm i
npm link tiny-whiteboard
npm run dev
```

打包

```bash
cd app
npm run build
```

# 安装

```bash
npm i tiny-whiteboard
```

# 使用

提供一个宽高不为`0`的容器元素，然后实例化`tiny-whiteboard`。

```js
import TinyWhiteboard from "tiny-whiteboard";

// 创建实例
let app = new TinyWhiteboard({
    container: container
});
// 接下来可以调用实例`app`的各种方法或者监听各种事件。
// 可以参考/app项目的示例。
```

# 坐标转换相关

项目内涉及到坐标转换相关的比较复杂和凌乱，如果没有搞清楚很容易迷失。大体上有以下这些：

1.鼠标坐标是相对屏幕的，需要转换成相对容器的，也就是鼠标坐标的`x`、`y`需要减去容器和屏幕左侧及上方的距离。

2.元素的坐标都是相对容器坐标系的，也就是屏幕坐标系，原点在左上角，向右及向下为正方向，而画布的坐标在中心位置，也就是容器的中心点，也是向右及向下为正方向，所以绘制元素时需要把元素坐标转换成画布坐标，具体来说就是元素的`x`、`y`坐标需要容器宽高的`1/2`。

3.画布滚动后，鼠标滚动时只支持垂直方向滚动，只读模式下可以鼠标按住画布进行任意拖动，滚动只是单纯记录一个滚动偏移量`scrollX`和`scrollY`，元素的实际坐标是没有变化的，只是在绘制元素的时候加上了`scrollX`和`scrollY`，向上和向右滚动时`scroll`值为正，向下和向左滚动为负，元素的`x`、`y`坐标需要减去`scrollX`、`scrollY`。

4.画布缩放后，缩放是应用在画布整体上，元素的实际位置和大小是没有变化的，所以当检测位置时鼠标的位置需要反向缩放才能对应到元素的实际坐标，具体来说就是鼠标坐标先转成画布坐标，然后除以缩放值，最后再转换屏幕坐标。

5.当元素旋转后，元素的大小和位置的值是没有变化的，只是通过`rotate`值进行了旋转，所以当通过鼠标位置检测元素时，鼠标的位置需要以元素的中心为旋转中心，反向进行旋转，然后再进行计算。

6.当开启网格时，坐标会和网格对齐，也就是坐标需要对网格的大小取余，然后减去该余数。

# 文档

## 1.实例化

```html
<div id="container"></div>
```

```js
import TinyWhiteboard from "tiny-whiteboard";

// 创建实例
let app = new TinyWhiteboard({
    container: document.getElementById('container')
});
```

### 实例化选项

| 字段名称             | 类型    | 默认值           | 描述                                                         | 是否必填 |
| -------------------- | ------- | ---------------- | ------------------------------------------------------------ | -------- |
| container | Element |                  | 容器元素 | 是 |
| drawType | String  | selection | 当前画布的绘制模式，比如选择模式、矩形绘制模式、自由画笔模式等等 | 否 |
| state | Object  | {} | 画布状态，对象，具体的属性请参考表格1-1 | 否 |

### 表格1-1 画布状态对象state的属性

| 字段名称        | 类型    | 默认值                                         | 描述                                                         |
| --------------- | ------- | ---------------------------------------------- | ------------------------------------------------------------ |
| scale           | Number  | 1                                              | 画布的缩放值，0-1                                            |
| scrollX         | Number  | 0                                              | 画布水平方向的滚动偏移量                                     |
| scrollY         | Number  | 0                                              | 画布垂直方向的滚动偏移量                                     |
| scrollStep      | Number  | 50                                             | 画布滚动步长                                                 |
| backgroundColor | String  |                                                | 画布背景颜色                                                 |
| showGrid        | Boolean | false                                          | 画布是否显示网格                                             |
| readonly        | Boolean | false                                          | 画布是否是只读模式                                           |
| gridConfig      | Object  | {size: 20,strokeStyle: "#dfe0e1",lineWidth: 1} | 画布网格配置，size（网格大小）、strokeStyle（网格线条颜色）、lineWidth（网格线条宽度） |

### 实例属性

| 属性名称  | 类型    | 描述                   |
| --------- | ------- | ---------------------- |
| opts      | Object  | 实例化选项             |
| container | Element | 容器元素               |
| drawType  | String  | 画布当前绘制模式       |
| canvas    | Element | 主画布元素             |
| ctx       | Object  | 主画布元素的绘图上下文 |
| state     | Object  | 画布当前状态           |

### 实例方法

#### undo()

回退。

#### redo()

前进。

#### setActiveElementStyle(style)

为画布当前激活的元素设置样式。

`style`：样式对象，`object`类型，具体属性请参考表格1-2。

#### 表格1-2 元素样式对象style属性

| 属性名          | 类型   | 默认值                    | 描述                                                |
| --------------- | ------ | ------------------------- | --------------------------------------------------- |
| strokeStyle     | String | \#000000                  | 线条颜色                                            |
| fillStyle       | String | transparent               | *填充颜色*                                          |
| lineWidth       | String | small                     | 线条宽度，small（2px）、middle（4px）、large（6px） |
| lineDash        | Number | 0                         | 线条虚线大小                                        |
| globalAlpha     | Number | 1                         | 透明度                                              |
| fontSize        | Number | 18                        | 字号，文本元素特有样式                              |
| lineHeightRatio | Number | 1.5                       | 行高，文本元素特有样式                              |
| fontFamily      | String | 微软雅黑, Microsoft YaHei | 字体，文本元素特有样式                              |

#### exportImage(opt)

导出为图片

`opt`：导出选项，`Object`，具体属性如下：

`opt.type`：导出图片类型，`String`，默认为`image/png`；

`opt.renderBg`：是否显示背景，`Boolean`，默认为`true`；

`opt.useBlob`：是否以`blob`类型导出，`Boolean`，默认为`DataURL`类型，以`blob`类型导出时函数的返回值是一个`promise`；

`opt.paddingX`：绘制的水平内边距，`Number`，默认为`10`像素；

`opt.paddingY`：绘制的垂直内边距，`Number`，默认为`10`像素；

#### exportJson()

导出为`json`数据。

#### setSelectedElementStyle(style)

为当前多选元素设置样式。

`style`：样式对象，可参考表格1-2。

#### showGrid()

显示网格。

#### hideGrid()

隐藏网格。

#### updateGrid(config)

更新网格配置。

`config`：配置对象，`Object`，具体配置可参考表格1-1 的`gridConfig`属性。

#### setEditMode()

设置为编辑模式。

#### setReadonlyMode()

设置为只读模式。

#### setData(data, noEmitChange)

设置画布数据，包括状态数据及元素数据。

`data`：数据，`Object`，包括以下两个字段：

`data.state`：画布状态数据，`Object`，详情请参考表格1-1。

`data.elements`：画布上的元素数据，`Array`。

`data`数据一般是通过调用`getData()`方法获取到的数据进行回填。

`noEmitChange`：禁止触发历史记录收集及`change`事件触发，`Boolean`，默认为`false`，某些场景下需要设置为`true`避免无限循环。

#### resize()

当容器的大小变化后需要调用该方法。

#### updateState(data)

更新画布状态数据。

`data`： 画布状态，`Object`，详情可参考表格1-1。

#### updateCurrentType(drawType)

更新画布当前绘制模式。

`drawType`：绘制模式，`String`，可选值如下表格所示：

| 值        | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| selection | 选择模式，该模式下可以单击某个元素进行激活元素，或进行多选元素操作 |
| rectangle | 矩形绘制模式                                                 |
| diamond   | 菱形绘制模式                                                 |
| triangle  | 三角形绘制模式                                               |
| circle    | 圆形绘制模式                                                 |
| line      | 线段绘制模式                                                 |
| arrow     | 箭头绘制模式                                                 |
| freedraw  | 自由画笔绘制模式                                             |
| text      | 文字绘制模式                                                 |
| image     | 图片绘制模式                                                 |
| eraser    | 橡皮擦模式                                                   |

#### clearActiveElements()

清除当前激活元素。

#### deleteElement(*element*)

删除某个元素。

#### copyElement(*element*, *notActive* = false)

复制某个元素。

`notActive`：只复制而不激活，`Boolean`，默认为`false`。

#### empty()

清空元素。

#### zoomIn(num)

放大。

`num`：放大值，`Number`，默认为`0.1`。

#### zoomOut(num)

缩小。

`num`：缩小值，`Number`，默认为`0.1`。

#### setZoom(zoom)

设置指定缩放值。

`zoom`：`Number`，`0-1`。

#### setBackgroundColor(color)

设置背景颜色。

#### getData()

获取数据，包括状态数据及元素数据，可进行持久化。

####  scrollTo(*scrollX*, *scrollY*)

滚动至指定位置。

`scrollX, scrollY`：滚动距离，`Number`。

#### scrollToCenter()

滚动至中心，即定位到所有元素的中心位置。

#### resetCurrentType()

复位当前画布绘制模式到选择模式。

#### on(eventName, callback, context)

监听事件。事件请见下方表格：

| 事件名称            | 描述                             | 回调参数                                             |
| ------------------- | -------------------------------- | ---------------------------------------------------- |
| zoomChange          | 缩放时触发                       | scale（当前缩放值）                                  |
| scrollChange        | 滚动时触发                       | scrollX（当前水平滚动值）、scrollY（当前垂直滚动值） |
| currentTypeChange   | 绘制模式变化时触发               | drawType（当前绘制模式）                             |
| change              | 画布状态数据变化或元素变化时触发 | data（状态和元素数据）                               |
| shuttle             | 前进后退时触发                   | index（当前指针）、length（当前历史记录数量）        |
| activeElementChange | 激活元素变化事件                 | activeElements（当前激活的元素）                     |
| multiSelectChange   | 多选元素选择完成时触发           | selectedElementList（当前被多选选中的元素）          |

#### emit(eventName, ...args)

触发事件。

#### off(eventName, callback?)

解绑事件。



## 2.render渲染实例

可通过`app.render`获取到该实例。

### 实例属性

| 属性名称          | 类型    | 描述               |
| ----------------- | ------- | ------------------ |
| activeElements    | Array   | 当前激活的元素     |
| isCreatingElement | Boolean | 当前正在创建新元素 |
| isResizing        | Boolean | 当前正在调整元素   |

### 实例方法

#### addElement(*element*)

添加元素。

#### deleteElement(*element*)

删除元素。

#### deleteAllElements()

删除全部元素。

#### hasActiveElements()

是否存在激活元素。

#### addActiveElement(*element*)

添加激活元素。

#### setActiveElements(*elements*)

替换激活元素。

#### deleteActiveElement(*element*)

删除指定激活元素。

#### clearActiveElements()

清除当前激活元素。

#### createElement(*opts* = {}, callback = () => {}, *ctx* = null, *notActive*)

创建元素。

`opts`：创建元素的选项；

`callback`：回调函数，回调参数：element（创建的元素）；

`ctx`：回调函数的上下文对象；

`notActive`：是否不要激活该新创建的元素，默认为`false`；

#### clearCanvas()

清除画布。

#### render()

渲染所有元素。



## 3.coordinate坐标转换实例

可通过`app.coordinate`获取到该实例。

### 实例方法

#### addScrollY(*y*)

加上画布当前垂直的滚动距离。

#### addScrollX(*x*)

加上画布当前水平的滚动距离。

#### subScrollY(*y*)

减去画布当前垂直的滚动距离。

#### subScrollX(*x*)

减去画布当前水平的滚动距离。

#### transformToCanvasCoordinate(*x*, *y*)

屏幕坐标转换成画布坐标。

#### transformToScreenCoordinate(*x*, *y*)

画布转换转屏幕坐标。

#### transform(*x*, *y*)

综合转换，屏幕坐标转画布坐标，再减去滚动值。

#### windowToContainer(*x*, *y*)

相对窗口的坐标转换成相对容器的，用于当容器非全屏的时候。

#### containerToWindow(*x*, *y*)

相对容器的坐标转换成相对窗口的，用于当容器非全屏的时候。

#### scale(*x*, *y*)

屏幕坐标在应用画布缩放后的位置。

#### reverseScale(*x*, *y*)

屏幕坐标在反向应用画布缩放后的位置。

#### gridAdsorbent(*x*, *y*)

网格吸附。



## 4.event事件实例

可通过`app.event`获取该实例。



## 5.cursor鼠标样式实例

可通过`app.cursor`获取该实例。

### 实例方法

#### set(*type* = "default")

设置鼠标指针样式。

#### hide()

隐藏鼠标指针。

#### reset()

复位鼠标指针。

#### setCrosshair()

设置为 ✚ 字型。

#### setMove()

设置为 可移动 状态。

#### setEraser()

设置为橡皮擦样式。



## 6.history历史记录管理实例

可通过`app.history`获取该实例。

### 实例方法

#### undo()

后退。

#### redo()

前进。

#### add(*data*)

添加一个历史记录数据，`data`一般是通过`app.getData()`获取到的数据。

#### clear()

清空历史记录数据。



## 7.export导入导出实例

可通过`app.export`获取该实例。

### 实例方法

#### exportImage(opt)

导出为图片，参数详见前面的文档。

#### exportJson()

导出为json数据。



## 8.background背景设置实例

可通过`app.background`获取该实例。

### 实例方法

#### addBackgroundColor()

添加背景颜色，背景色值为`app.state.backgroundColor`。

#### remove()

移除背景。

#### canvasAddBackgroundColor(*ctx*, *width*, *height*, *backgroundColor*)

给一个`canvas`设置背景颜色，非`css`样式。

`ctx`：`canvas`绘图上下文。



## 9.selection多选实例

可通过`app.selection`获取该实例。



## 10.mode模式实例

可通过`app.mode`获取该实例。

### 实例方法

#### setEditMode()

设置为编辑模式。

#### setReadonlyMode()

设置为只读模式。



## 11.imageEdit图片选择实例

可通过`app.imageEdit`获取该实例。



## 12.textEdit文字编辑实例

可通过`app.textEdit`获取该实例。

