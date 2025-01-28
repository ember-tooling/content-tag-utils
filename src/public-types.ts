export interface Coordinates {
  /**
   * Line number that the content starts on.
   * This is 1-indexed
   */
  line: number;
  /**
   * Column number that the content starts on.
   * This is 0-indexed
   */
  column: number;
  /**
   * How much the `<template>` is indented (as if in a class)
   */
  columnOffset: number;

  /**
   * The character index of the start of the content in the original source
   */
  start: number;
  /**
   * The character index of the end of the content in the original source
   */
  end: number;
}
