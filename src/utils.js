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

// 计算中心点相同的两个坐标相差的角度
export const getTowPointRotate = (cx, cy, tx, ty, fx, fy) => {
  return radToDeg(Math.atan2(ty - cy, tx - cx) - Math.atan2(fy - cy, fx - cx));
};

// 获取坐标经指定中心点旋转指定角度的坐标，顺时针还是逆时针rotate传正负即可
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
export const getElementCenterPoint = (element) => {
  let { x, y, width, height } = element;
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
};

// 以指定中心点反向旋转坐标指定角度
export const transformPointReverseRotate = (x, y, cx, cy, rotate) => {
  if (rotate !== 0) {
    let rp = getRotatedPoint(x, y, cx, cy, -rotate);
    x = rp.x;
    y = rp.y;
  }
  return {
    x,
    y,
  };
};

// 根据元素是否旋转了处理鼠标坐标，如果元素旋转了，那么鼠标坐标要反向旋转回去
export const transformPointOnElement = (x, y, element) => {
  let center = getElementCenterPoint(element);
  return transformPointReverseRotate(x, y, center.x, center.y, element.rotate);
};

// 获取元素的四个角坐标
export const getElementCornerPoint = (element, dir) => {
  let { x, y, width, height } = element;
  switch (dir) {
    case "topLeft":
      return {
        x,
        y,
      };
    case "topRight":
      return {
        x: x + width,
        y,
      };
    case "bottomRight":
      return {
        x: x + width,
        y: y + height,
      };
    case "bottomLeft":
      return {
        x,
        y: y + height,
      };
    default:
      break;
  }
};

// 获取元素旋转后的四个角坐标
export const getElementRotatedCornerPoint = (element, dir) => {
  let center = getElementCenterPoint(element);
  let dirPos = getElementCornerPoint(element, dir);
  return getRotatedPoint(
    dirPos.x,
    dirPos.y,
    center.x,
    center.y,
    element.rotate
  );
};

// 判断一个坐标是否在一个矩形内
// 第三个参数可以直接传一个带有x、y、width、height的元素对象
export const checkPointIsInRectangle = (x, y, rx, ry, rw, rh) => {
  if (typeof rx === "object") {
    let element = rx;
    rx = element.x;
    ry = element.y;
    rw = element.width;
    rh = element.height;
  }
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
};

// 获取多个点的外包围框
export const getBoundingRect = (pointArr = []) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  pointArr.forEach((point) => {
    let [x, y] = point;
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }
    if (y < minY) {
      minY = y;
    }
    if (y > maxY) {
      maxY = y;
    }
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// 简单深拷贝
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
