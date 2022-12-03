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
  VOID,
  keys
} = require('./constants.js');

const {Token} = require('./token.js');

const noSpaces = str => str.replace(/^[\r\n]\s*|\s*[\r\n]\s*$/g, '');

const parse = (template, nmsp, components, tree) => {
  const addStatic = ({index}, content) => {
    const chunk = noSpaces(esx.slice(i, index));
    if (chunk) {
      const {length} = chunk;
      let i = 0, j = i;
      do {
        j = chunk.indexOf(NUL, i);
        if (j < 0)
          addChunk(noSpaces(chunk.slice(i)));
        else {
          addChunk(noSpaces(chunk.slice(i, j)));
          const token = new Token(INTERPOLATION, VOID, VOID, true, INTERPOLATION_NAME, VOID);
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
  const addChunk = value => {
    if (value)
      addToken(new Token(STATIC, VOID, VOID, false, STATIC_NAME, value));
  };
  const addToken = token => {
    tree[0].children.push(token);
  };
  const pushTree = token => {
    if (tree.length)
      addToken(token);
    else
      tree = [token];
    tree = [token, tree];
  };
  const updates = [];
  const esx = template.join(NUL);
  const tag = /(<(\/)?(\S*?)>)|(<(\S+)([^>/]*?)(\/)?>)/g;
  let match, i = 0;
  while (match = tag.exec(esx)) {
    const [content, _1, closing, other, _4, name, attrs, selfClosing] = match;
    switch (content) {
      case '<>': {
        addStatic(match, content);
        pushTree(new Token(FRAGMENT, EMPTY, [], false, FRAGMENT_NAME, VOID));
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
            const values = /((\S+)=((('|")([^\5]*)\5)|\x00)|\x00)/g;
            let match;
            while (match = values.exec(attrs)) {
              const [_0, _1, name, _3, _4, quote, value] = match;
              if (quote)
                attributes.push(new Token(ATTRIBUTE, VOID, VOID, false, name, value));
              else {
                const type = name ? ATTRIBUTE : INTERPOLATION;
                const token = new Token(type, VOID, VOID, true, name || INTERPOLATION_NAME, VOID);
                attributes.push(token);
                updates.push(token);
              }
            }
          }
          const children = selfClosing ? EMPTY : [];
          const tagName = name || other;
          const isComponent = components.has(tagName);
          const type = isComponent ? COMPONENT : ELEMENT;
          const value = isComponent ? nmsp[tagName] : VOID;
          pushTree(new Token(type, attributes, children, false, tagName, value));
          if (selfClosing)
            tree = tree[1];
        }
        break;
      }
    }
  }
  const token = tree[0];
  const arrow = values => {
    for (let i = 0; i < updates.length; i++)
      updates[i].value = values[i];
    return token;
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
    parse(template, nmsp, components, EMPTY)
  )(values);
};

exports.ESX = ESX;
exports.Token = Token;
