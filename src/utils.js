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

// 弧度转角度
export const radToDeg = (rad) => {
  return rad * (180 / Math.PI);
};

// 角度转弧度
export const degToRad = (deg) => {
  return deg * (Math.PI / 180);
};

// 计算两个坐标相差的角度
export const getTowPointRotate = (cx, cy, tx, ty, fx, fy) => {
  return radToDeg(Math.atan2(ty - cy, tx - cx) - Math.atan2(fy - cy, fx - cx));
};

// 获取坐标经指定中心点旋转后未旋转前的坐标
export const getUnRotatedPoint = (x, y, cx, cy, rotate) => {
  let deg = radToDeg(Math.atan2(y - cy, x - cx));
  let del = deg - rotate;
  let dis = getTowPointDistance(x, y, cx, cy);
  return {
    x: Math.cos(degToRad(del)) * dis + cx,
    y: Math.sin(degToRad(del)) * dis + cy,
  };
};

// 获取坐标经指定中心点旋转指定角度后的新坐标
export const getRotatedPoint = (x, y, cx, cy, rotate) => {
  let deg = radToDeg(Math.atan2(y - cy, x - cx));
  let del = deg + rotate;
  let dis = getTowPointDistance(x, y, cx, cy);
  return {
    x: Math.cos(degToRad(del)) * dis + cx,
    y: Math.sin(degToRad(del)) * dis + cy,
  };
};

// 获取元素的中心点坐标
export const getElementCenterPos = (element) => {
  let { x, y, width, height } = element;
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
};

// 反向旋转坐标
export const transformPointReverseRotate = (x, y, cx, cy, rotate) => {
  if (rotate !== 0) {
    let rp = getUnRotatedPoint(x, y, cx, cy, rotate);
    return {
      x: rp.x,
      y: rp.y,
    };
  } else {
    return {
      x,
      y,
    };
  }
};

// 根据元素是否旋转了处理鼠标坐标，如果元素旋转了，那么鼠标坐标要反向旋转回去
export const transformPointOnElement = (x, y, element) => {
  // 元素旋转了，那么检测时要将鼠标的坐标旋转回去
  let center = getElementCenterPos(element);
  return transformPointReverseRotate(x, y, center.x, center.y, element.rotate);
};

// 获取元素旋转后的左上角坐标
export const getElementRotatedTopLeftPos = (element) => {
  let center = getElementCenterPos(element);
  return getRotatedPoint(
    element.x,
    element.y,
    center.x,
    center.y,
    element.rotate
  );
};

// 获取元素旋转后的右上角坐标
export const getElementRotatedTopRightPos = (element) => {
  let center = getElementCenterPos(element);
  return getRotatedPoint(
    element.x + element.width,
    element.y,
    center.x,
    center.y,
    element.rotate
  );
};

// 获取元素旋转后的右下角坐标
export const getElementRotatedBottomRightPos = (element) => {
  let center = getElementCenterPos(element);
  return getRotatedPoint(
    element.x + element.width,
    element.y + element.height,
    center.x,
    center.y,
    element.rotate
  );
};

// 获取元素旋转后的左下角坐标
export const getElementRotatedBottomLeftPos = (element) => {
    let center = getElementCenterPos(element);
    return getRotatedPoint(
      element.x,
      element.y + element.height,
      center.x,
      center.y,
      element.rotate
    );
  };