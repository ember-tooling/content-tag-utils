export { Transformer, ParseResultStringUtils } from "./transformer.js";

/**
 * Transforms each template within a gjs or gts file
 *
 * @param {string} source the original source
 * @param {(innerContent: string): string} eachTemplate the function to run on each of the contents (omitting the outer `<template>` and `</template>` tags)
 * @return {string}
 */
export function transform(
  source: string,
  eachTemplate: (innerContent: string) => string,
): string;

interface ContentRangeResult {
  /**
   * Byte range for the content.
   * The content excludes the opening `<template>` and closing `</template>`
   */
  contentRange: {
    /**
     * The start byte index of the content-range
     */
    start: number;
    /**
     * The end byte index of the content-range
     */
    end: number;
  };
}

/**
 * For a given source document (gjs or gts), and a single parseResult (one of the entries from the array returned from content-tag's parse), what is the line/column number of the first character
 * for that parseResult, and the columnOffset (useful for extracting templates to do work on and then put back, or giving pointers to errors present in the template).
 *
 * @param {string} source the original source
 * @param {ContentRangeResult} parseResult
 */
export function coordinatesOf(
  /**
   * the original source
   */
  source: string,
  /**
   * one of the entries from the array returned from content-tag's parse function
   * (only contentRange is needed)
   */
  parseResult: ContentRangeResult,
): {
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
};
