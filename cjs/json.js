'use strict';
/** (c) Andrea Giammarchi - ISC */

const {Token} = require('./token.js');
const {EMPTY} = require('./constants.js');

function parse(esx, nmsp, ...rest) {
  const ids = (this || JSON).parse(esx, ...rest);
  return fromJSON.call({ids, nmsp: nmsp || globalThis}, ids.pop());
}
exports.parse = parse

function stringify(esx, ...rest) {
  const ids = [];
  const json = toJSON.call(ids, esx);
  ids.push(json);
  return (this || JSON).stringify(ids, ...rest);
}
exports.stringify = stringify

function fromJSON(esx) {
  const {type} = esx;
  switch (type) {
    case Token.COMPONENT:
      esx.value = this.nmsp[esx.name];
    case Token.ELEMENT:
    case Token.FRAGMENT: {
      esx.attributes = (esx.attributes || EMPTY).map(fromJSON, this);
      esx.children = (esx.children || EMPTY).map(fromJSON, this);
      if (esx.hasOwnProperty('id'))
        esx.id = this.ids[esx.id];
      return Object.setPrototypeOf(esx, Token.prototype);
    }
    case Token.INTERPOLATION: {
      const {value: v} = esx;
      return {type: Token.INTERPOLATION, value: v && (v.i || fromJSON.call(this, v))};
    }
  }
  return esx;
};

function toJSON(esx) {
  const {type} = esx;
  switch (type) {
    case Token.COMPONENT:
    case Token.ELEMENT:
    case Token.FRAGMENT: {
      const token = new Token;
      token.type = type;
      if (esx.hasOwnProperty('id')) {
        const i = this.indexOf(esx.id);
        token.id = i < 0 ? (this.push(esx.id) - 1) : i;
      }
      const {attributes, children} = esx;
      if (attributes.length)
        token.attributes = attributes;
      if (children.length)
        token.children = children.map(toJSON, this);
      if (esx.name)
        token.name = esx.name;
      return token;
    }
    case Token.INTERPOLATION:
      const {value} = esx;
      return {...esx, value: value instanceof Token ? toJSON.call(this, value) : {i: value}};
  }
  return esx;
};
