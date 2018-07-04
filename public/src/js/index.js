import api from './api.js';

const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');
const ratio = 1;
const x = 1000;
const y = 600;
canvas.setAttribute('width', x * ratio);
canvas.setAttribute('height', y * ratio);
canvas.style.width = x + 'px';
canvas.style.height = y + 'px';
// ctx.scale(2, 2)

function getData () {
  $.ajax({
    url: '/api/price?code=SZ000001&count=75',
    type: 'GET',
    data: {
      a1: 'a111',
      b1: 'b111'
    },
    success: function (res) {
      drawDayLine(res.data);
    }
  });
}

const kWidth = 10 * 2;
const kHeight = 200 * 2;
function drawDayLine(data, res) {
  const tmp = data.concat();
  const lowest = tmp.sort((a, b) => {
    return api.sortByProps(a, b, {'low': 'asc'})
  }).slice(0, 1)[0].low;
  const highest = tmp.sort((a, b) => {
    return api.sortByProps(a, b, {'high': 'desc'})
  }).slice(0, 1)[0].high;

  data = data.sort((a, b) => {
    return api.sortByProps(a, b, {'time': 'asc'})
  });

  // ctx.translate(0.5, 0.5);
  /*data.map((item, index) => {
    drawBaseLine(item, index, lowest, highest);
  });*/
  drawBaseInfo(data, lowest, highest);

  // 当日最低最高
  data.map((item, index) => {
    // drawKLine(item, index, lowest, highest);
  });
  // 当日开盘收盘
  ctx.lineWidth = 16;
  data.map((item, index) => {
    // drawKKLine(item, index, lowest, highest);
  });
}

function getFiveEqual(lowest, highest, base) {

  ctx.fillColor = '#000';
  ctx.textAlign = 'left';
  const divide = 4;
  for (let i = 0; i <= divide; i++) {
    const y = (base / divide) * i;
    const price = (highest - lowest) / divide * (divide - i) + lowest;
    const baseline = i ? (i === divide ? 'bottom' : 'middle') : 'top';
    ctx.moveTo(0, y);
    ctx.lineTo(x*2, y);
    ctx.stroke();

    setTimeout(() => {
      ctx.textBaseline = baseline;
      ctx.fillText(price.toFixed(2), 0, y);
    }, 0);
  }

}

function drawBaseInfo(data, lowest, highest) {

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ccc';
  ctx.font = '24px Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,\\5FAE\8F6F\96C5\9ED1,Arial,sans-serif';
  ctx.textBaseline = 'bottom';

  const monthFirstDay = {};
  ctx.textAlign = 'center';
  data.map((item, index) => {
    const month = new Date(item.time * 1000).getMonth() + 1;
    if (!monthFirstDay[month] && index > 5) {
      monthFirstDay[month] = item.time;

      ctx.beginPath();
      ctx.moveTo((index + 1) * kWidth, kHeight);
      ctx.lineTo((index + 1) * kWidth, 0);
      ctx.stroke();
      ctx.fillText(api.getDate(new Date(item.time * 1000)), (index+1)*kWidth, 500);
    }
  });

  getFiveEqual(lowest, highest, kHeight);

}

function drawKLine(data, index, lowest, highest) {

  let color;
  const rate = kHeight / (highest - lowest);
  if (data.close >= data.open) {
    color = 'red';
  } else {
    color = 'green';
  }
  const open = (data.open - lowest) * rate;
  const close = (data.close - lowest) * rate;
  const low = (data.low - lowest) * rate;
  const high = (data.high - lowest) * rate;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo((index+1)*kWidth, kHeight - low);
  ctx.lineTo((index+1)*kWidth, kHeight - high);
  ctx.stroke();

}

function drawKKLine(data, index, lowest, highest) {

  let color;
  const rate = kHeight / (highest - lowest);
  if (data.close >= data.open) {
    color = 'red';
  } else {
    color = 'green';
  }
  const open = (data.open - lowest) * rate;
  const close = (data.close - lowest) * rate;
  const low = (data.low - lowest) * rate;
  const high = (data.high - lowest) * rate;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo((index+1)*kWidth, kHeight - open);
  ctx.lineTo((index+1)*kWidth, kHeight - close);
  ctx.stroke();

}



function init() {
  getData();
}

init();
