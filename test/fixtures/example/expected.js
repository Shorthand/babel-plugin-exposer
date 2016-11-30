var __exposer__getModule = function () {
  if (!('$Sh' in window)) window['$Sh'] = {
    m: {}
  };
  return function (name) {
    if (!(name in window['$Sh'].m)) window['$Sh'].m[name] = {};
    return window['$Sh'].m[name];
  };
}();

const __exposer__module = __exposer__getModule('example/actual');

__exposer__module.test = function test() {
  console.log('text');
};

export function test() {
  return __exposer__module.test();
}

__exposer__module.initTest = function initTest() {
  console.log('initTest');
  test();
};

export default __exposer__module.initTest;
