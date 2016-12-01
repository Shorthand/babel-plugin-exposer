# babel-plugin-exposer

Expose modules to global scope for monkey-patch-ability

## Example

**In**

```js
export function test() {
  console.log('text');
}

export default function initTest() {
  console.log('initTest');
  test();
}
```

**Out**

```js
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
```

## Installation

```sh
$ npm install babel-plugin-exposer
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["exposer"]
}
```

### Via CLI

```sh
$ babel --plugins exposer script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["exposer"]
});
```
