import { Preprocessor } from "content-tag";

const p = new Preprocessor();

/**
 * @internal
 * @param {string} source
 * @param {import('./public-types.ts').TransformerOptions} [options]
 */
export function parse(source, options = {}) {
  return p.parse(source, { inline_source_map: false, ...options });
}
