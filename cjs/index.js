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
  keys
} = require('./constants.js');

const {Token} = require('./token.js');

const noSpaces = str => str.replace(/^[\r\n]\s*|\s*[\r\n]\s*$/g, '');

const addToken = ([{children}], token) => {
  children.push(token);
};

const parse = (template, nmsp, components) => {
  const addStatic = ({index}, content) => {
    const chunk = noSpaces(esx.slice(i, index));
    if (chunk) {
      const {length} = chunk;
      let i = 0, j = i;
      do {
        j = chunk.indexOf('\x00', i);
        if (j < 0)
          addChunk(noSpaces(chunk.slice(i)));
        else {
          addChunk(noSpaces(chunk.slice(i, j)));
          const token = new Token(INTERPOLATION, true, INTERPOLATION_NAME);
          addToken(tree, token);
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
      addToken(tree, new Token(STATIC, false, STATIC_NAME, value));
  };
  const pushTree = token => {
    if (tree)
      addToken(tree, token);
    tree = [token, tree || token];
  };
  const updates = [];
  const esx = template.join('\x00');
  const tag = /(<(\/)?(\S*?)>)|(<(\S+)([^>/]*?)(\/)?>)/g;
  let tree, match, i = 0;
  while (match = tag.exec(esx)) {
    const [content, _1, closing, other, _4, name, attrs, selfClosing] = match;
    switch (content) {
      case '<>': {
        addStatic(match, content);
        pushTree(new Token(FRAGMENT, false, FRAGMENT_NAME, FRAGMENT_NAME, EMPTY, []));
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
                attributes.push(new Token(ATTRIBUTE, false, name, value));
              else {
                const token = new Token(
                  name ? ATTRIBUTE : INTERPOLATION,
                  true,
                  name || INTERPOLATION_NAME
                );
                attributes.push(token);
                updates.push(token);
              }
            }
          }
          const tagName = name || other;
          const isComponent = components.has(tagName);
          pushTree(new Token(
            isComponent ? COMPONENT : ELEMENT,
            false,
            tagName,
            isComponent ? nmsp[tagName] : tagName,
            attributes,
            selfClosing ? EMPTY : []
          ));
          if (selfClosing)
            tree = tree[1];
        }
        break;
      }
    }
  }
  const arrow = values => {
    for (let i = 0; i < updates.length; i++)
      updates[i].value = values[i];
    return tree;
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
const ESX = (nmsp = {}) => {
  const components = new Set(keys(nmsp));
  return (template, ...values) => (
    templates.get(template) ||
    parse(template, nmsp, components)
  )(values);
};

exports.ESX = ESX;
exports.Token = Token;
