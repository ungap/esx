/** (c) Andrea Giammarchi - ISC */

const {assign, freeze, keys} = Object;

export {assign, keys};

export const ATTRIBUTE =      1;
export const COMPONENT =      2;
export const ELEMENT =        3;
export const FRAGMENT =       4;
export const INTERPOLATION =  5;
export const STATIC =         6;

export const FRAGMENT_NAME = '#fragment';
export const INTERPOLATION_NAME = '#interpolation';
export const STATIC_NAME = '#static';

export const EMPTY = freeze([]);
export const NUL = '\x00';
export const OBJECT = {};
export const VOID = void 0;
