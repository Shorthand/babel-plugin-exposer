var __exposer__getModule = function (s, h) {
  var module = function (n) {
    if (!(n in s[h].m)) s[h].m[n] = {};
    return s[h].m[n];
  };

  if (!(h in s)) s[h] = {
    m: {},
    module: module
  };
  return module;
}(window, '$Sh');

const __exposer__module = __exposer__getModule('example/actual');

__exposer__module.test = function test() {
  console.log('text');
};

export function test(...args) {
  return __exposer__module.test(...args);
}

__exposer__module.initTest = function initTest() {
  console.log('initTest');
  test();
};

export default function initTest(...args) {
  return __exposer__module.initTest(...args);
}
