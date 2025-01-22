import { Preprocessor } from 'content-tag';
import { coordinatesOf } from './coordinates-of.js';

const p = new Preprocessor();

/**
 * @param {string} source
 */
export function extractTemplates(source) {
  let parsed = p.parse(source, { inline_source_map: false });

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
    start,
    end,

    // Relevant data from content-tag, for reversing the coordinates
    contentRange: parsed.contentRange,
  }
}
