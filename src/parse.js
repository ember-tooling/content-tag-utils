import { Preprocessor } from "content-tag";

const p = new Preprocessor();

/**
 * @internal
 * @param {string} source
 */
export function parse(source) {
  return p.parse(source, { inline_source_map: false });
}
