
/**
 * @param {string} source
 * @param {import('./internal-types.ts').ContentRangeResult} parsedResult
 */
export function coordinatesOf(source, parsedResult) {
  /**
   * range is the full range, including the leading and trailing <tempalte>,</template>
   * contentRange is the range between / excluding the leading and trailing <template>,</template>
   */
  let { contentRange: byteRange } = parsedResult;
  let buffer = Buffer.from(source, 'utf8');
  let inclusiveContent = buffer.slice(byteRange.start, byteRange.end).toString();
  let beforeContent = buffer.slice(0, byteRange.start).toString();
  let before = beforeContent.length;

  let startCharIndex = before;
  let endCharIndex = before + inclusiveContent.length;

  const contentBeforeTemplateStart = beforeContent.split('\n');
  const lineBeforeTemplateStart = contentBeforeTemplateStart.at(-1);

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
    columnOffset: lineBeforeTemplateStart.length - lineBeforeTemplateStart.trimStart().length,
    // character index, not byte index
    start: startCharIndex,
    // character index, not byte index
    end: endCharIndex,
  };
}

