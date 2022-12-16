const {ESX, Token} = require('../cjs/index.js');

function Component() {}
Component.Nested = function () {};

const assert = (value, expected, message = `expected: ${expected} - received: ${value}`) => {
  if (value !== expected)
    throw new Error(message);
};

const assertFields = (value, expected) => {
  for (const key of Object.keys(expected)) {
    assert(
      value.hasOwnProperty(key) ||
      Object.getPrototypeOf(value).hasOwnProperty(key),
      true,
      `${key} should exist`
    );
    assert(value[key], expected[key], `${key} value: expected ${expected[key]} - received: ${value[key]}`);
  }
};

const esx = ESX({Component});

var outcome = esx`<div />`;
const {attributes: empty} = outcome;

assertFields(outcome, {
  type: Token.ELEMENT,
  attributes: empty,
  properties: null
});


var outcome = esx`<div a="1" b='2' c=${3} ${{d: 4}} />`;
assert(JSON.stringify(outcome.properties), '{"a":"1","b":"2","c":3,"d":4}');

var outcome = esx`<>a ${'b'} c</>`;
assertFields(outcome, {
  type: Token.FRAGMENT,
  attributes: empty,
  properties: null
});

var outcome = esx`
  <Component>
    <div>
    a
    ${'b'}
    c
    </div>
  </Component>
`;
assertFields(outcome, {
  type: Token.COMPONENT,
  name: 'Component',
  value: Component
});

assert(outcome.children[0].children.length, 3);
assertFields(outcome.children[0].children[0], {
  type: Token.STATIC,
  value: 'a'
});
assertFields(outcome.children[0].children[1], {
  type: Token.INTERPOLATION,
  value: 'b'
});
assertFields(outcome.children[0].children[2], {
  type: Token.STATIC,
  value: 'c'
});

var outcome = esx`
  <Component>
    <div>
    a
    ${'b'}
    </div>
  </Component>
`;

assert(outcome.children[0].children.length, 2);
assertFields(outcome.children[0].children[0], {
  type: Token.STATIC,
  value: 'a'
});
assertFields(outcome.children[0].children[1], {
  type: Token.INTERPOLATION,
  value: 'b'
});

var outcome = esx`<Component>
  a ${'b'} c 
</Component>`;
assertFields(outcome.children[0], {
  type: Token.STATIC,
  value: 'a '
});
assertFields(outcome.children[1], {
  type: Token.INTERPOLATION,
  value: 'b'
});
assertFields(outcome.children[2], {
  type: Token.STATIC,
  value: ' c'
});

var outcome = esx`<Component.Nested />`;
assertFields(outcome, {
  type: Token.COMPONENT,
  name: 'Component.Nested',
  value: Component.Nested
});

var outcome = esx`
  <>
    <Component />
    <Component />
  </>
`;

assertFields(outcome.children[0], {
  type: Token.COMPONENT,
  value: Component
});
assertFields(outcome.children[1], {
  type: Token.COMPONENT,
  value: Component
});
