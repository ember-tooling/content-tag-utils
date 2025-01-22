export interface ContentRangeResult {
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
 * The line index of a document or partial document.
 * This is 1-indexed, rather than the traditional 0-index that arrays use.
 */
type LineIndex = number;

/**
 * The column index of a document or partial document.
 * This is a 0-indexed value, like how arrays traditionally are.
 *
 * (Unlike Line-indexes)
 */
type ColumnIndex = number;

export interface TemplateCoordinates {
  line: LineIndex;
  column: ColumnIndex;
}

export interface InnerCoordinates {
  line: LineIndex;
  endLine: LineIndex;
  column: ColumnIndex;
  endColumn: ColumnIndex;
}

export interface TemplateInfo {
  // Useful for further processing
  contents: string;

  // Coordinates
  line: number;
  column: number;
  columnOffset: number;

  // Character Indexes
  start: number;
  end: number;

  contentRange: ContentRangeResult["contentRange"];
}
