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
  EMPTY
} = require('./constants.js');

const {Token} = require('./token.js');

function parse(esx, nmsp, ...rest) {
  return fromJSON((this || JSON).parse(esx, ...rest), nmsp);
}
exports.parse = parse

function stringify(esx, ...rest) {
  return (this || JSON).stringify(toJSON(esx), ...rest);
}
exports.stringify = stringify

const fromJSON = (esx, nmsp = {}) => {
  const {type} = esx;
  switch (type) {
    case ATTRIBUTE: {
      const {dynamic, name, value} = esx;
      return new Token(ATTRIBUTE, !!dynamic, name, value);
    }
    case COMPONENT:
    case ELEMENT: {
      const {attributes, children, name} = esx;
      return new Token(
        type,
        false,
        name,
        type === ELEMENT ? name : nmsp[name],
        attributes ? attributes.map(revive, nmsp) : EMPTY,
        children ? children.map(revive, nmsp) : EMPTY
      );
    }
    case FRAGMENT:
      return new Token(type, false, FRAGMENT_NAME, FRAGMENT_NAME, EMPTY, esx.children.map(revive, nmsp));
    case INTERPOLATION: {
      const {value: v} = esx;
      return new Token(type, true, INTERPOLATION_NAME, v.i || fromJSON(v, nmsp));
    }
    case STATIC:
      return new Token(type, false, STATIC_NAME, esx.value);
  }
};
exports.fromJSON = fromJSON;

const toJSON = esx => {
  const {type} = esx;
  switch (type) {
    case ATTRIBUTE: {
      const {dynamic, name, value} = esx;
      return dynamic ? {type, dynamic: 1, name, value} : {type, name, value};
    }
    case COMPONENT:
    case ELEMENT: {
      const {attributes, children, name} = esx;
      const json = {type, name};
      if (attributes !== EMPTY)
        json.attributes = attributes.map(toJSON);
      if (children !== EMPTY)
        json.children = children.map(toJSON);
      return json;
    }
    case FRAGMENT:
      return {type, children: esx.children.map(toJSON)};
    case INTERPOLATION: {
      const {value} = esx;
      return {type, value: value instanceof Token ? toJSON(value) : {i: value}};
    }
    case STATIC:
      return {type, value: esx.value};
  }
};
exports.toJSON = toJSON;

function revive(esx) {
  return fromJSON(esx, this);
}
