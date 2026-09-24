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
   * The character index of the start of the content in the original source.
   *
   * if there is a leading BOM, it is stripped.
   */
  start: number;
  /**
   * The character index of the end of the content in the original source
   *
   * if there is a leading BOM, it is stripped.
   */
  end: number;
}

export interface TransformerOptions {
  /**
   * Whether or not to use inline sourcemaps -- defaults to false.
   */
  inline_source_map?: boolean;

  /**
   * The filename representing the passed source string
   */
  filename?: string;
}
