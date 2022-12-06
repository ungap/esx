# ESX as Template Literal Tag

[![build status](https://github.com/ungap/esx/actions/workflows/node.js.yml/badge.svg)](https://github.com/ungap/esx/actions) [![Coverage Status](https://coveralls.io/repos/github/ungap/esx/badge.svg?branch=main)](https://coveralls.io/github/ungap/esx?branch=main) [![CSP strict](https://webreflection.github.io/csp/strict.svg)](https://webreflection.github.io/csp/#-csp-strict)

<sup><sub>**EXPERIMENTAL** ⚠</sub></sup> <sup><sub>**THIS PROJECT IS BROKEN AND UNDER HEAVY REFACTORING - FEEL FREE TO PLAY WITH IT BUT DON'T USE IT IN PRODUCTION** ⚠</sub></sup>

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
  // note: props doesn't need ${...props} (invalid JS)
  //       or ...${props} (ambiguous and unnecesary template chunks)
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
<summary><strong>The Token Struct</strong></summary>

|  field       |                 type                     |                                                                 description                                                                 |
| :----------- |:----------------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------:|
| type         | number                                   | any of the `Token` types: `Token.ATTRIBUTE`, `Token.COMPONENT`, `Token.ELEMENT`, `Token.FRAGMENT`, `Token.INTERPOLATION` or `Token.STATIC`. |
| attributes   | (attribute \| interpolation)[]?          | meaningful only for *components* or *elements*, it's an array of *attributes* and/or *interpolations* tokens. |
| children     | (attribute \| interpolation \| token)[]? | meaningful only for *components*, *elements* or *fragments*, here referred as *token*, it's an array of *static*, *interpolation*, or *token* children. |
| dynamic      | boolean                                  | when `true` it means that future updates will change the token `value` with latest passed interpolation. *interpolation* and, optionally, *attribute* are the only one with `dynamic` equal `true`. |
| name         | string                                   | the *attribute*, *component* or *element* name, otherwise the string `#fragment`, `#interpolation` or `#static`. |
| value        | unknown?                                 | for an *attribute*, an *interpolation*, or a *static* token, it's the `value` it represents. It's always a *string* for non-dynamic attributes and static tokens, it could be anything else in other cases. *element* and *fragment* don't carry any value while *component* points at whatever reference was passed to the factory *ESX(...)* function to create the tag. |

</details>

<details>
<summary><strong>Performance</strong></summary>

  * **transformer** - the tokenizer takes less than 1ms to transform even complex templates, closing it to zero time to update the resulting structure
  * **memory** - each unique template generates *one and one only* token, updating interpolations and values *only* when the same template is executed again. This procedure grants no extra memory or Garbage Collector pressure when the same template is reused multiple times, also weakly relating the template with its own tokens to keep the heap under control
  * **serialization** - complex structures can still be serialized in less than 1ms and revived in even less than that
  * **size** - once minified and compressed, the [es.js](./es.js) file is around 820bytes while the [json.js](./json.js) helper is around 580bytes

</details>

<details>
<summary><strong>Extras</strong></summary>

  * **self-closing** - because *ESX* is fully inspired by *JSX*, and because it doesn't strictly represent neither *XML* nor *HTML* but it's closer to the former, `<self-closing />` tags are always allowed for any kind of node
  * **short-closing** - still inspired by *JSX*, any element can use the fragment shortcut to close itself. `<any-element>...</>` is perfectly allowed
  * **any interpolation** - either *attributes* or *children* can contain *Token.INTERPOLATION* entries, without expecting a spread operation, or even an object. `<el ${anyValue} />`, as example,is a perfectly valid tokenized tree

</details>

<details>
<summary><strong>TODOs / Help needed</strong></summary>

- [ ] decide how to deal with types for TypeScript users / improve JSDoc TS at least around exported utilities.
- [ ] align the [Babel transformer](https://github.com/ungap/babel-plugin-transform-esx) to provide the same uniqueness around tokens, so that each token is created once and only updates happen on demand.
- [ ] a *VSCode* compatible syntax highlighter to see *ESX as Template Literal* the same as *ESX* or *JSX*, with the invetibale `${}` interpolation difference, yet exactly the same contraints and highlights *JSX* has.
- [ ] a library to showcase *ESX*, either upgrading *udomsay* to use this instead of the [Babel transformer](https://github.com/ungap/babel-plugin-transform-esx), or creating a variant of that library based on this project.

</details>

### About ESX

The idea behind *ESX* is to have a general purpose representation of a tree through well defined tokens that can be understood, and consumed, by any library or framework.

<details>
<summary><strong>What this module is</strong></summary>

  * provide a way to understand interpolations and components through an always same, well defined, crawable struct
  * components can be global or scoped, as long as the factory created *tag* knows their name and can provide their values: `const tag = ESX({MyComp, Array, any: specialCase})`
  * interpolations can be part of the *attributes* list or the *children*
  * static parts within *children* are also well defined among other types: elements, fragments, components, interpolations
  * tokens are unique and (virtually) immutable, but their interpolation values get synchronously updated on repeated calls of the same template

</details>

<details>
<summary><strong>What this module is NOT</strong></summary>

  * a way to handle *HTML* specifications or create *DOM* related only solutions. The *DOM* and any *HTML* specs is fully ignored, including the names any element can have, or its attributes. `@click`, `?disabled`, `.setter`, these are all valid attributes represented with their name, including literally any special char that is not a *space*
  * a way to handle *XML* specifications or create *XML* related only solution. Similarly with the previous point, *ESX* is general purpose, and simple, by design

</details>
