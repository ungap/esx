'use strict';
/** (c) Andrea Giammarchi - ISC */

const {
  ATTRIBUTE,
  COMPONENT,
  ELEMENT,
  FRAGMENT,
  INTERPOLATION,
  STATIC,
  FRAGMENT_NAME,
  INTERPOLATION_NAME,
  STATIC_NAME,
  EMPTY,
  NUL,
  OBJECT,
  facade,
  keys
} = require('./constants.js');

const {Token} = require('./token.js');

const newTree = (token, prev) => ({token, prev});
const noSpaces = str => str.replace(/^[\r\n]\s*|\s*[\r\n]\s*$/g, '');

const parse = (template, nmsp, components) => {
  const addStatic = ({index}, content) => {
    const chunk = noSpaces(esx.slice(i, index));
    if (chunk) {
      const {length} = chunk;
      let i = 0, j = i;
      do {
        j = chunk.indexOf(NUL, i);
        if (j < 0)
          addString(noSpaces(chunk.slice(i)));
        else {
          addString(noSpaces(chunk.slice(i, j)));
          const token = facade(INTERPOLATION, INTERPOLATION_NAME, true);
          addToken(token);
          updates.push(token);
          i = j + 1;
          if (i === length)
            break;
        }
      } while (~j);
    }
    i = index + content.length;
  };
  const addString = value => {
    if (value)
      addToken(facade(STATIC, STATIC_NAME, false, value));
  };
  const addToken = token => {
    tree.token.children.push(token);
  };
  const pushTree = token => {
    if (tree)
      addToken(token);
    else
      tree = newTree(token);
    tree = newTree(token, tree);
  };
  const updates = [];
  const esx = template.join(NUL);
  const tag = /(<(\/)?(\S*?)>)|(<(\S+)([^>/]*?)(\/)?>)/g;
  let tree, match, i = 0;
  while (match = tag.exec(esx)) {
    const [content, _1, closing, other, _4, name, attrs, selfClosing] = match;
    switch (content) {
      case '<>': {
        addStatic(match, content);
        pushTree(new Token(FRAGMENT, EMPTY, [], FRAGMENT_NAME));
        break;
      }
      case '</>': {
        addStatic(match, content);
        tree = tree.prev;
        break;
      }
      default: {
        addStatic(match, content);
        if (closing)
          tree = tree.prev;
        else {
          let attributes = EMPTY;
          if (attrs && attrs.trim()) {
            attributes = [];
            const values = /((\S+)=((('|")([^\5]*)\5)|\x00)|\x00)/g;
            let match;
            while (match = values.exec(attrs)) {
              const [_0, _1, name, _3, _4, quote, value] = match;
              if (quote)
                attributes.push(facade(ATTRIBUTE, name, false, value));
              else {
                const token = facade(name ? ATTRIBUTE : INTERPOLATION, name || INTERPOLATION_NAME, true);
                attributes.push(token);
                updates.push(token);
              }
            }
          }
          const children = selfClosing ? EMPTY : [];
          const tagName = name || other;
          const isComponent = components.has(tagName);
          const type = isComponent ? COMPONENT : ELEMENT;
          const value = isComponent ? nmsp[tagName] : tagName;
          pushTree(new Token(type, attributes, children, tagName, value));
          if (selfClosing)
            tree = tree.prev;
        }
        break;
      }
    }
  }
  const {token: root} = tree;
  const arrow = values => {
    for (let i = 0; i < updates.length; i++)
      updates[i].value = values[i];
    return root;
  };
  templates.set(template, arrow);
  return arrow;
};

const templates = new WeakMap;

/**
 * A template literal tag factory function able to recognize within its content passed components.
 * @param {object} nmsp the env/namespace that defines components for the resulting tag.
 * @returns {function} the `esx` tag function that will recognize passed components.
 */
const ESX = (nmsp = OBJECT) => {
  const components = new Set(keys(nmsp));
  return (template, ...values) => (
    templates.get(template) ||
    parse(template, nmsp, components)
  )(values);
};

exports.ESX = ESX;
exports.Token = Token;
