/** (c) Andrea Giammarchi - ISC */

import {
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
  OBJECT,
  VOID
} from './constants.js';

import {Token} from './token.js';

const {parse: $parse, stringify: $stringify} = JSON;

export const parse = (esx, nmsp, ...rest) => fromJSON($parse(esx, ...rest), nmsp);
export const stringify = (esx, ...rest) => $stringify(toJSON(esx), ...rest);

export const fromJSON = (esx, nmsp = OBJECT) => {
  const {type} = esx;
  switch (type) {
    case ATTRIBUTE: {
      const {dynamic, name, value} = esx;
      return new Token(ATTRIBUTE, VOID, VOID, !!dynamic, name, value);
    }
    case COMPONENT:
    case ELEMENT: {
      const {attributes, children, name} = esx;
      const attrs = attributes ? attributes.map(revive, nmsp) : EMPTY;
      const childrn = children ? children.map(revive, nmsp) : EMPTY;
      const value = type === ELEMENT ? VOID : nmsp[name];
      return new Token(type, attrs, childrn, false, name, value);
    }
    case FRAGMENT:
      return new Token(type, EMPTY, esx.children.map(revive, nmsp), false, FRAGMENT_NAME, VOID);
    case INTERPOLATION: {
      const {value: v} = esx;
      return new Token(type, VOID, VOID, true, INTERPOLATION_NAME, v.i || fromJSON(v, nmsp));
    }
    case STATIC:
      return new Token(type, VOID, VOID, false, STATIC_NAME, esx.value);
  }
};

export const toJSON = esx => {
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

function revive(esx) {
  return fromJSON(esx, this);
}
