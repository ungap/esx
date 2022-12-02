# ESX as Template Literal Tag

[![build status](https://github.com/ungap/esx/actions/workflows/node.js.yml/badge.svg)](https://github.com/ungap/esx/actions) [![Coverage Status](https://coveralls.io/repos/github/ungap/esx/badge.svg?branch=main)](https://coveralls.io/github/ungap/esx?branch=main) [![CSP strict](https://webreflection.github.io/csp/strict.svg)](https://webreflection.github.io/csp/#-csp-strict)

<sup><sub>**EXPERIMENTAL** ⚠</sub></sup>

This project is based on [TC39 discussions](https://es.discourse.group/t/proposal-esx-as-core-js-feature/1511) and it tokenizes *JSX* like written template literals through a unified *ESXToken* class.

### Features / API

<details open>
<summary><strong>Free-form Components</strong></summary>

Differently from *JSX*, or even *ESX Babel transformer*, components can be passed to the *ESX factory utility*, producing the expected resulting tokens.

```js
import {ESX, Token} from '@ungap/esx';

// the factory function accepts an object
// that will be used to tokenize components
const esx = ESX({MyComponent});

esx`
  <div data-any="value">
    <MyComponent a="1" b=${2} />
  </div>
`;

function MyComponent(props, ...children) {
  // note: props doesn't need ${...props} or ...${props}
  //       because any value can be passed as interpolation
  return esx`
    <div ${props}>
      ${children}
    </div>
  `;
}
```

The main advangate of this approach is that *ESX* can survive both minification and serialization, beside allowing also *lower-case* components, *namespaces*, and so on, as long as the factory function receives an object with those keys:

```js
import {ESX, Token} from '@ungap/esx';

const env = {['some:comp']: someComp};
const esx = ESX(env);

esx`
  <div data-any="value">
    <some:comp a="1" b=${2} />
  </div>
`;

function someComp(props, ...children) {}
```

</details>

<details>
<summary><strong>Serialization</strong></summary>

Differently from other solutions based either on *DOM* or callbacks, *ESX* is simply an intermediate representation of the template literal content.

Thanks to its simple and unified *Token* shape, it can be serialized as compact, yet readable, *JSON*, surviving cross realm or environment boundaries.

In order to achieve this, a few handy utilities are provided through the `@ungap/esx/json` helper:

```js
import {ESX, Token} from '@ungap/esx';
import {toJSON, fromJSON} from '@ungap/esx/json';

const esx = ESX({Comp});

const program = esx`
  <div data-any="value">
    <Comp a="1" b=${2} />
  </div>
`;

const json = toJSON(program);
// JSON.stringify(json)

// revive all the tokens at once
// note: the object with components, if present,
//       must be provided
const newProgram = fromJSON(json, {Comp});

function Comp() {}
```

To simplify even further serialization, `stringify` and `parse` are also offered as utilities, allowing extra parameters too.

```js
import {ESX, Token} from '@ungap/esx';
import {stringify, parse} from '@ungap/esx/json';

const environment = {A, B};
const esx = ESX(environment);

const program = esx`
  <A data-any="value">
    <B a="1" b=${2} />
  </A>
`;

// JSON.stringify(program, ...rest)
const str = stringify(program, ...rest);

// JSON.parse(str, ...rest)
const revived = fromJSON(str, environment, ...rest);

function A() {}
function B() {}
```

</details>

<details>
<summary><strong>Performance</strong></summary>

  * **transformer** - the tokenizer takes less than 1ms to transform even complex templates, closing it to zero time to update the resulting structure.
  * **memory** - each unique template generates *one and one only* token, updating interpolations and values *only* when the same template is executed again. This procedure grants no extra memory or Garbage Collector pressure when the same template is reused multiple times, also weakly relating the template with its own tokens to keep the heap under control.
  * **serialization** - complex structures can still be serialized in less than 1ms and revived in even less than that.
  * **size** - once minified and compressed, the [es.js](./es.js) file is around 900bytes while the [json.js](./json.js) helper is around 600bytes.

</details>

<details>
<summary><strong>Extras</strong></summary>

  * **self-closing** - because *ESX* is fully inspired by *JSX*, and because it doesn't strictly represent neither *XML* nor *HTML* but it's closer to the former, `<self-closing />` tags are always allowed for any kind of node.
  * **short-closing** - still inspired by *JSX*, any element can use the fragment shortcut to close itself. `<any-element>...</>` is perfectly allowed.
  * **any interpolation** - either *attributes* or *children* can contain *Token.INTERPOLATION* entries, without expecting a spread operation, or even an object. `<el ${anyValue} />`, as example,is a perfectly valid tokenized tree.

</details>

<details>
<summary><strong>TODOs / Help needed</strong></summary>

- [ ] decide how to deal with types for TypeScript users / improve JSDoc TS at least around exported utilities.
- [ ] align the [Babel transformer](https://github.com/ungap/babel-plugin-transform-esx) to provide the same uniqueness around tokens, so that each token is created once and only updates happen on demand.
- [ ] a *VSCode* compatible syntax highlighter to see *ESX as Template Literal* the same as *ESX* or *JSX*, with the invetibale `${}` interpolation difference, yet exactly the same contraints and highlights *JSX* has.
- [ ] a library to showcase *ESX*, either upgrading *udomsay* to use this instead of the [Babel transformer](https://github.com/ungap/babel-plugin-transform-esx), or creating a variant of that library based on this project.

</details>
