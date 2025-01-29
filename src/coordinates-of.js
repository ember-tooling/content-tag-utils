/**
 * For a given source document (gjs or gts), and a single parseResult (one of the entries from the array returned from content-tag's parse), what is the line/column number of the first character
 * for that parseResult, and the columnOffset (useful for extracting templates to do work on and then put back, or giving pointers to errors present in the template).
 *
 * @param {string | Buffer} source the original source
 * @param {import('./internal-types.ts').ContentRangeResult} parsedResult
 * @return {import('./public-types.ts').Coordinates}
 */
export function coordinatesOf(source, parsedResult) {
  /**
   * range is the full range, including the leading and trailing <tempalte>,</template>
   * contentRange is the range between / excluding the leading and trailing <template>,</template>
   */
  let buffer;
  if (typeof source === "string") {
    buffer = Buffer.from(source, "utf8");
  } else if (source instanceof Buffer) {
    buffer = source;
  } else {
    throw new Error(
      `Expected first arg to coordinatesOf to be either a string or buffer`,
    );
  }

  let { contentRange: byteRange } = parsedResult;
  let inclusiveContent = buffer
    .slice(byteRange.start, byteRange.end)
    .toString();
  let beforeContent = buffer.slice(0, byteRange.start).toString();
  let before = beforeContent.length;

  let startCharIndex = before;
  let endCharIndex = before + inclusiveContent.length;

  const contentBeforeTemplateStart = beforeContent.split("\n");
  /** @type {string} */
  const lineBeforeTemplateStart = /** @type {string} */ (
    contentBeforeTemplateStart.at(-1)
  );

  /**
   * Reminder:
   *   Rows are 1-indexed
   *   Columns are 0-indexed
   *
   * (for when someone inevitably needs to debug this and is comparing
   *  with their editor (editors typically use 1-indexed columns))
   */
  return {
    line: contentBeforeTemplateStart.length,
    column: lineBeforeTemplateStart.length,
    // any indentation of the <template> parts (class indentation etc)
    columnOffset:
      lineBeforeTemplateStart.length -
      lineBeforeTemplateStart.trimStart().length,
    // character index, not byte index
    start: startCharIndex,
    // character index, not byte index
    end: endCharIndex,
  };
}
