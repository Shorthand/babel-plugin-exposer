# babel-plugin-exposer

Expose modules to global scope for monkey-patch-ability

## Example

**In**

```js
// input code
```

**Out**

```js
"use strict";

// output code
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
