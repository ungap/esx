'use strict';
/** (c) Andrea Giammarchi - ISC */

const {Token} = require('./token.js');
const {EMPTY} = require('./constants.js');

const NUL = '\x00';

const noSpaces = str => str.replace(
  /^[\r\n]\s*|\s*[\r\n]\s*$/g,
  ''
);

const base = (type, value) => ({type, value});

const attribute = (dynamic, name, value) => ({
  type: Token.ATTRIBUTE, dynamic, name, value
});

const node = (type, attributes, children, name, value) => ({
  [NUL + 'p']: NUL + 0,
  type,
  attributes: attributes === EMPTY ? (NUL + 1) : attributes,
  children: children === EMPTY ? (NUL + 1) : children,
  name,
  value
});

const parse = (template, nmsp, components) => {
  const addStatic = ({index}, content) => {
    const chunk = noSpaces(esx.slice(i, index));
    const {length} = chunk;
    if (length) {
      let i = 0, j = i;
      do {
        j = chunk.indexOf('\x00', i);
        if (j < 0)
          addChunk(noSpaces(chunk.slice(i)));
        else {
          addChunk(noSpaces(chunk.slice(i, j)));
          addToken(base(Token.INTERPOLATION, NUL + 'a' + ++updates));
          i = j + 1;
          if (i === length)
            break;
        }
      } while (~j);
    }
    i = index + content.length;
  };
  const addChunk = value => {
    if (value)
      addToken(base(Token.STATIC, value));
  };
  const addToken = token => {
    tree[0].children.push(token);
  };
  const pushTree = token => {
    if (tree) addToken(token);
    tree = [token, tree || token];
  };
  const getKey = value => {
    const i = context.indexOf(value);
    return NUL + (i < 0 ? (context.push(value) - 1) : i);
  };
  const context = [Token.prototype, EMPTY, {}];
  const esx = template.join('\x00');
  let tree, i = 0, updates = 0;
  for (const match of esx.matchAll(/(<(\/)?(\S*?)>)|(<(\S+)([^>/]*?)(\/)?>)/g)) {
    const [content, _1, closing, other, _4, name, attrs, selfClosing] = match;
    switch (content) {
      case '<>': {
        addStatic(match, content);
        pushTree(node(Token.FRAGMENT, EMPTY, []));
        break;
      }
      case '</>': {
        addStatic(match, content);
        tree = tree[1];
        break;
      }
      default: {
        addStatic(match, content);
        if (closing)
          tree = tree[1];
        else {
          let attributes = EMPTY;
          if (attrs && attrs.trim()) {
            attributes = [];
            for (
              const [_0, _1, name, _3, _4, quote, value] of
              attrs.matchAll(/((\S+)=((('|")([^\5]*)\5)|\x00)|\x00)/g)
            ) {
              if (quote)
                attributes.push(attribute(false, name, value));
              else {
                const value = NUL + 'a' + ++updates;
                attributes.push(
                  name ?
                    attribute(true, name, value) :
                    base(Token.INTERPOLATION, value)
                );
              }
            }
          }
          const tagName = name || other;
          const isComponent = components.has(tagName);
          pushTree(node(
            isComponent ? Token.COMPONENT : Token.ELEMENT,
            attributes,
            selfClosing ? EMPTY : [],
            tagName,
            isComponent ? getKey(nmsp[tagName]) : tagName
          ));
          if (selfClosing)
            tree = tree[1];
        }
        break;
      }
    }
  }

  tree.id = NUL + 2;
  const result = {
    f: Function(
      `return ${
        JSON.stringify(tree).replace(
          /"\\u0000([ap]?)(\d*)"/g,
          (_, a, i) =>
            a === 'p' ? '__proto__' : `${a ? 'arguments' : 'this'}[${i}]`
        )
      }`),
    c: context
  };
  templates.set(template, result);
  return result;
};

const templates = new WeakMap;

/**
 * A template literal tag factory function able to recognize within its content passed components.
 * @param {object} nmsp the env/namespace that defines components for the resulting tag.
 * @returns {function} the `esx` tag function that will recognize passed components.
 */
const ESX = (nmsp = {}) => {
  const components = new Set(Object.keys(nmsp));
  return function esx(template) {
    const {f, c} = (
      templates.get(template) ||
      parse(template, nmsp, components)
    );
    return f.apply(c, arguments);
  };
};

exports.ESX = ESX;
exports.Token = Token;
