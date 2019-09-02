import * as colors from 'colors/safe';

export function m(text: any) {
  return colors.magenta(text.toString());
}

export function g(text: any) {
  return colors.green(text.toString());
}

export function r(text: any) {
  return colors.red(text.toString());
}