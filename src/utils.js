// 计算两点之间的距离
export const getTowPointDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

// 计算点到直线的距离
export const getPointToLineDistance = (x, y, x1, y1, x2, y2) => {
  // 直线垂直于x轴
  if (x1 === x2) {
    return Math.abs(x - x1);
  } else {
    let B = 1;
    let A, C;
    A = (y1 - y2) / (x2 - x1);
    C = 0 - B * y1 - A * x1;
    return Math.abs((A * x + B * y + C) / Math.sqrt(A * A + B * B));
  }
};

// 检查是否点击到了一条线段
export const checkIsAtSegment = (x, y, x1, y1, x2, y2, dis = 10) => {
  if (getPointToLineDistance(x, y, x1, y1, x2, y2) > dis) {
    return false;
  }
  let dis1 = getTowPointDistance(x, y, x1, y1);
  let dis2 = getTowPointDistance(x, y, x2, y2);
  let dis3 = getTowPointDistance(x1, y1, x2, y2);
  let max = Math.sqrt(dis * dis + dis3 * dis3);
  if (dis1 <= max && dis2 <= max) {
    return true;
  }
  return false;
};
