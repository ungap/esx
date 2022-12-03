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
    dynamic, name, value
  ) {
    this.type = type;
    this.attributes = attributes;
    this.children = children;
    this.dynamic = dynamic;
    this.name = name;
    this.value = value;
  }

  /** @type {object | null} an accessor to forward properties */
  get properties() {
    switch (this.type) {
      case ELEMENT:
      case COMPONENT:
        const {attributes} = this;
        if (attributes !== EMPTY) {
          const properties = {};
          for (const entry of attributes) {
            if (entry.type === ATTRIBUTE)
              properties[entry.name] = entry.value;
            else
              assign(properties, entry.value);
          }
          return properties;
        }
    }
    return null;
  }
}
