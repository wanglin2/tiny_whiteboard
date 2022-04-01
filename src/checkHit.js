import { checkIsAtSegment, getTowPointDistance } from "./utils";
import { HIT_DISTANCE } from "./constants";

// 检测是否点击到折线上
export const checkIsAtMultiSegment = (segments, rp) => {
  let res = false;
  segments.forEach((seg) => {
    if (res) return;
    if (checkIsAtSegment(rp.x, rp.y, ...seg, HIT_DISTANCE)) {
      res = true;
    }
  });
  return res;
};

// 检测是否点击到矩形边缘
export const checkIsAtRectangleEdge = (element, rp) => {
  let { x, y, width, height } = element;
  let segments = [
    [x, y, x + width, y],
    [x + width, y, x + width, y + height],
    [x + width, y + height, x, y + height],
    [x, y + height, x, y],
  ];
  return checkIsAtMultiSegment(segments, rp) ? element : null;
};

// 根据宽高计算圆的半径
export const getCircleRadius = (width, height) => {
  return Math.min(Math.abs(width), Math.abs(height)) / 2;
};

// 检测是否点击到圆的边缘
export const checkIsAtCircleEdge = (element, rp) => {
  let { width, height, x, y } = element;
  let radius = getCircleRadius(width, height);
  let dis = getTowPointDistance(rp.x, rp.y, x + radius, y + radius);
  let onCircle = dis >= radius - HIT_DISTANCE && dis <= radius + HIT_DISTANCE;
  return onCircle ? element : null;
};

// 检测是否点击到线段边缘
export const checkIsAtLineEdge = (element, rp) => {
  let segments = [];
  let len = element.pointArr.length;
  let arr = element.pointArr;
  for (let i = 0; i < len - 1; i++) {
    segments.push([...arr[i], ...arr[i + 1]]);
  }
  return checkIsAtMultiSegment(segments, rp) ? element : null;
};

// 检测是否点击到自由线段边缘
export const checkIsAtFreedrawLineEdge = (element, rp) => {
  let res = null;
  element.pointArr.forEach((point) => {
    if (res) return;
    let dis = getTowPointDistance(rp.x, rp.y, point[0], point[1]);
    if (dis <= HIT_DISTANCE) {
      res = element;
    }
  });
  return res;
};

// 检测是否点击到菱形边缘
export const checkIsAtDiamondEdge = (element, rp) => {
  let { x, y, width, height } = element;
  let segments = [
    [x + width / 2, y, x + width, y + height / 2],
    [x + width, y + height / 2, x + width / 2, y + height],
    [x + width / 2, y + height, x, y + height / 2],
    [x, y + height / 2, x + width / 2, y],
  ];
  return checkIsAtMultiSegment(segments, rp) ? element : null;
};

// 检测是否点击到三角形边缘
export const checkIsAtTriangleEdge = (element, rp) => {
  let { x, y, width, height } = element;
  let segments = [
    [x + width / 2, y, x + width, y + height],
    [x + width, y + height, x, y + height],
    [x, y + height, x + width / 2, y],
  ];
  return checkIsAtMultiSegment(segments, rp) ? element : null;
};

// 检测是否点击到箭头边缘
export const checkIsAtArrowEdge = (element, rp) => {
  let pointArr = element.pointArr;
  let x = pointArr[0][0];
  let y = pointArr[0][1];
  let tx = pointArr[pointArr.length - 1][0];
  let ty = pointArr[pointArr.length - 1][1];
  let segments = [
    [x, y, tx, ty],
  ];
  return checkIsAtMultiSegment(segments, rp) ? element : null;
};
