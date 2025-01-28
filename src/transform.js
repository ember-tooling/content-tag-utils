import { parse } from "./parse.js";
import { replaceTemplates } from "./replate-templates.js";
import { Transformer } from "./transformer.js";

/**
 * @param {string} source
 * @param {(innerTemplateContents: string) => string} callback
 */
export function transform(source, callback) {
  let t = new Transformer(source);

  t.transformAllSync(callback);

  return t.toString();
}
