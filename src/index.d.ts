export { Transformer } from "./transformer.js";

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

export function extractTemplates(source: string): {
  // Useful for further processing
  contents: string;

  /**
   * The line index of a document or partial document.
   * This is 1-indexed, rather than the traditional 0-index that arrays use.
   */
  line: number;
  /**
   * The column index of a document or partial document.
   * This is a 0-indexed value, like how arrays traditionally are.
   *
   * (Unlike Line-indexes)
   */
  column: number;
  /**
   * How much the `<template>` is indented (as if in a class)
   */
  columnOffset: number;

  /**
   * start-index of the character of the beginning the range
   */
  start: number;
  /**
   * end-index of the character of the ending the range
   */
  end: number;

  contentRange: ContentRangeResult["contentRange"];
}[];

/**
 * Given a set of templates, the source, and a transform function, return a new string representing
 * what the the source should become.
 *
 * This is split from the `transform` function for helping optimize how frequently a full parse on the source document is needed.
 */
export function replaceTemplates(
  source: string,
  templates: ReturnType<import("./parse.js").parse>,
  eachTemplate: (innerContents: string) => string,
): string;

/**
 * Given inner coordinates scoped to a template, this function returns the coordinates
 * in the overall source file.
 */
export function reverseInnerCoordinates(
  /**
   * The coordinates of the template in the original source
   */
  templateCoordinates: { line: number; column: number },
  /**
   * The coordinates of the cursor, node, whatever within and relative to
   * the statr of inner template contents.
   */
  innerCoordinates: {
    line: number;
    endLine: number;
    column: number;
    endColumn: number;
  },
): {
  /**
   * The line in the original source file
   */
  line: number;
  /**
   * The end line in the original source file
   */
  endLine: number;
  /**
   * The column in the original source file
   */
  column: number;
  /**
   * The end column in the original source file
   */
  endColumn: number;
};
