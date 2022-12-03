'use strict';
/** (c) Andrea Giammarchi - ISC */

const {assign, freeze, keys} = Object;
exports.assign = assign;
exports.keys = keys;

const ATTRIBUTE =      1;
exports.ATTRIBUTE = ATTRIBUTE;
const COMPONENT =      2;
exports.COMPONENT = COMPONENT;
const ELEMENT =        3;
exports.ELEMENT = ELEMENT;
const FRAGMENT =       4;
exports.FRAGMENT = FRAGMENT;
const INTERPOLATION =  5;
exports.INTERPOLATION = INTERPOLATION;
const STATIC =         6;
exports.STATIC = STATIC;

const FRAGMENT_NAME = '#fragment';
exports.FRAGMENT_NAME = FRAGMENT_NAME;
const INTERPOLATION_NAME = '#interpolation';
exports.INTERPOLATION_NAME = INTERPOLATION_NAME;
const STATIC_NAME = '#static';
exports.STATIC_NAME = STATIC_NAME;

const EMPTY = freeze([]);
exports.EMPTY = EMPTY;
const NUL = '\x00';
exports.NUL = NUL;
const OBJECT = {};
exports.OBJECT = OBJECT;

const facade = (type, name, dynamic, value) => ({type, value, name, dynamic});
exports.facade = facade;
