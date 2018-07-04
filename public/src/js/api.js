function sortByProps(item1, item2) {
  let props = [];
  for (let _i = 2; _i < arguments.length; _i++) {
    props[_i - 2] = arguments[_i]
  }

  let cps = []; // 存储排序属性比较结果。
  // 如果未指定排序属性，则按照全属性升序排序。
  let asc = true;
  let prop = props[0];
  for (let o in prop) {
    asc = prop[o] === "asc";
    if ( Number(item1[o]) > Number(item2[o]) ) {
      cps.push(asc ? 1 : -1);
      break; // 大于时跳出循环。
    } else if (Number(item1[o]) === Number(item2[o])) {
      cps.push(0);
    } else {
      cps.push(asc ? -1 : 1);
      break; // 小于时跳出循环。
    }
  }

  for (let j = 0; j < cps.length; j++) {
    if (cps[j] === 1 || cps[j] === -1) {
      return cps[j];
    }
  }
  return 0
}

function getDate(time = new Date()) {
  return (
    time.getFullYear() +
    '-' +
    (time.getMonth() + 1 < 10
      ? '0' + (time.getMonth() + 1)
      : time.getMonth() + 1) +
    '-' +
    (time.getDate() < 10 ? '0' + time.getDate() : time.getDate())
  );
}

export default {
  sortByProps,
  getDate
};
