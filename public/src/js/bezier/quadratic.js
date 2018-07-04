const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');

let percent = 0;

/**
 * 获取控制点
 * 参考：https://github.com/hujiulong/blog/issues/1
 * @return {[type]} [description]
 */
function getControlPoint(start, end, curveness) {
  return {
    x: (start.x + end.x) / 2 - (start.y - end.y) * curveness,
    y: (start.y + end.y) /2 - (end.x - start.x) * curveness
  }
}

/**
 * 绘制静态的曲线
 * @return {[type]} [description]
 */
function drawStaticPath(start, end, curveness) {
  ctx.clearRect(0, 0, 1000, 800);
  ctx.beginPath();
  const control = getControlPoint(start, end, curveness);
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
}


/**
 * 绘制二次贝塞尔曲线
 * @param  {[type]} start     起点
 * @param  {[type]} end       终点
 * @param  {[type]} curveness 曲度(0-1)
 */
function drawBezierCurvePath(start, end, curveness) {
  // 获取二次贝塞尔的控制点
  const control = getControlPoint(start, end, curveness);
  ctx.moveTo(start.x, start.y);
  // console.log(start, end, control);
  // ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);

  for (let t = 0; t < percent / 100 ; t+=0.01) {
    const x = quadraticBezier(start.x, control.x, end.x, t);
    const y = quadraticBezier(start.y, control.y, end.y, t);
    ctx.lineTo(x, y);
  }
}

function quadraticBezier(start, control, end, t) {
  const k = 1 - t;
  return k * k *start + 2 * k * t * control + t * t * end;
}

// 动态展示绘制贝塞尔曲线过程
function showBezierAnimate() {
  ctx.clearRect(0, 0, 1000, 800);
  ctx.beginPath();
  drawBezierCurvePath({x:100, y:100}, {x:300, y:300}, 0.5);
  ctx.stroke();
  percent = ( percent + 1 ) % 100;
  // requestAnimationFrame(showBezierAnimate);
}

drawStaticPath({x:200, y:200}, {x:300, y:300}, 0.5);

showBezierAnimate();


export default {
  drawBezierCurvePath
};
