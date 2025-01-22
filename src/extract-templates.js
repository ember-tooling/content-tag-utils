import { coordinatesOf } from "./coordinates-of.js";
import { parse } from "./parse.js";

/**
 * @param {string} source
 */
export function extractTemplates(source) {
  let parsed = parse(source);

  if (parsed.length === 0) {
    return [];
  }

  const result = parsed.map((templateInfo) => {
    const coordinates = coordinatesOf(source, templateInfo);

    return makeTemplateInfo(coordinates, templateInfo.contents, templateInfo);
  });

  return result;
}

/**
 * @param {ReturnType<typeof coordinatesOf>} coordinates
 * @param {string} contents
 * @param {import('./internal-types.ts').ContentRangeResult} parsed
 */
function makeTemplateInfo(coordinates, contents, parsed) {
  let { line, column, start, end, columnOffset } = coordinates;

  return {
    // Useful for further processing
    contents,

    // Coordinates
    line,
    column,
    columnOffset,

    // Character Indexes
    characterRange: { start, end },

    // Relevant data from content-tag, for reversing the coordinates
    byteRange: parsed.contentRange,
  };
}
