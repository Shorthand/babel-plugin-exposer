# babel-plugin-exposer

Expose ES6 modules to global scope for monkey-patch-ability

## Quick example

Example assumed options are set as `{ basePath: './src/', namespace: '_mystuff' }`. Options documented [further down](#usage).

```js
// Input file: src/my-module/foobar.js

export function doStuff() {
  console.log('I am doing stuff')
}

// default exports _must_ be named, for the moment
export default function hazFoo() {
  doStuff();
}
```

With this plugin in added, you can now call or even override `doStuff`:

```html
<script src="/static/my-compiled-bundle.js"></script>
<script>
// call `doStuff`
window._mystuff.module('my-module/foobar').doStuff();
// -> 'I am doing stuff'

// override `doStuff`
window._mystuff.module('my-module/foobar').doStuff = function() {
  console.log('I have been monkey-patched!');
}

// call default export (which internally calls the overridden `doStuff`)
window._mystuff.module('my-module/foobar').hasFoo();
// -> I have been monkey-patched!
</script>
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
  "plugins": [
    ["exposer", {
      "namespace": "_mystuff",
      "basePath": "./src/",
    }]
  ]
}
```

You *must* specify a `namespace` and `basePath`.

#### Options

*`namespace`*

This is the property name that will be attached to the window. e.g `window._mystuff`.

*`basePath`*

`basePath` is used to determine module names in the global scope. E.g. if you had a source file in your project called `./src/my-module/foobar.js` and your `basePath` being set to `./src/`: then you can access that module via `window._mystuff.module('my-module/foobar')`.


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

## How it works (Example Input and Output)

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
