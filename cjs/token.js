'use strict';
/** (c) Andrea Giammarchi - ISC */

const {
  ATTRIBUTE,
  COMPONENT,
  ELEMENT,
  FRAGMENT,
  INTERPOLATION,
  STATIC,
  EMPTY,
  assign
} = require('./constants.js');

function Token(type, dynamic, name, value, attributes, children) {
  this.type = type;
  this.attributes = attributes;
  this.children = children;
  this.name = name;
  this.value = value;
  this.dynamic = dynamic;
}

assign(Token, {
  ATTRIBUTE,
  COMPONENT,
  ELEMENT,
  FRAGMENT,
  INTERPOLATION,
  STATIC,
  prototype: {
    get properties() {
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
      return null;
    }
  }
});

exports.Token = Token;
