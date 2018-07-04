const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');

const ratio = 2;
const kWidth = 10 * 1;
const kHeight = 200 * 1;

const x = 1000;
const y = 600;
canvas.setAttribute('width', x * ratio);
canvas.setAttribute('height', y * ratio);

// ctx.scale(2, 2)

ctx.imageSmoothingEnabled = true;

/*var offScreenCanvas = document.createElement('canvas');
var offScreenCtx = offScreenCanvas.getContext('2d');
offScreenCanvas.setAttribute('width', x );
offScreenCanvas.setAttribute('height', y )

ctx.lineWidth = 1 * ratio;
ctx.strokeStyle = '#000';*/

ctx.lineWidth = 2;
// ctx.translate(0.5, 0.5);
ctx.beginPath();
ctx.moveTo(1 * kWidth, kHeight);
ctx.lineTo(1 * kWidth, 0);
ctx.stroke();
ctx.closePath();

// ctx.translate(-0.5, -0.5);
ctx.beginPath();
ctx.moveTo(2 * kWidth, kHeight);
ctx.lineTo(5 * kWidth, 0);
ctx.stroke();
ctx.closePath();

ctx.strokeStyle = '#000'
ctx.lineWidth = 2
ctx.strokeRect(100, 100, 100, 100)

ctx.translate(0.5, 0.5);
ctx.lineWidth = 1
ctx.strokeRect(200, 200, 100, 100)


const img = document.createElement('img');
img.src = 'http://stdl.qq.com/stdl/skin/10/wallpaper/4d335d1f9658b26b2d7d4418a1683c02.webp';
img.onload = function () {
  // ctx.drawImage(img, 0, 0, 420, 315, 0, 0, 420, 315);
}


export default {

};


/*ctx.drawImage(offScreenCanvas, 0, 0, canvas.width, canvas.height,
    0, 0, canvas.width, canvas.height);*/
