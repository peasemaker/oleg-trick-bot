import * as colors from 'colors/safe';

export function m(text: any) {
  return colors.bold(colors.magenta(text.toString()));
}

export function g(text: any) {
  return colors.bold(colors.green(text.toString()));
}

export function r(text: any) {
  return colors.bold(colors.red(text.toString()));
}

export function b(text: any) {
  return colors.bold(colors.blue(text.toString()));
}