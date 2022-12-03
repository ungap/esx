/** (c) Andrea Giammarchi - ISC */

import {
  ATTRIBUTE,
  COMPONENT,
  ELEMENT,
  FRAGMENT,
  INTERPOLATION,
  STATIC,

  EMPTY,

  assign
} from './constants.js';

export class Token {
  static ATTRIBUTE =      ATTRIBUTE;
  static COMPONENT =      COMPONENT;
  static ELEMENT =        ELEMENT;
  static FRAGMENT =       FRAGMENT;
  static INTERPOLATION =  INTERPOLATION;
  static STATIC =         STATIC;

  /** @private */
  constructor(
    type,
    attributes, children,
    name, value
  ) {
    this.type = type;
    this.attributes = attributes;
    this.children = children;
    this.name = name;
    this.value = value;
  }

  /** @type {boolean} an accessor to forward properties */
  get dynamic() {
    return false;
  }

  /** @type {object | null} an accessor to forward properties */
  get properties() {
    const {attributes} = this;
    if (attributes !== EMPTY) {
      const properties = {};
      for (const {type, value, name} of attributes) {
        if (type === ATTRIBUTE)
          properties[name] = value;
        else
          assign(properties, value);
      }
      return properties;
    }
    return null;
  }
}
