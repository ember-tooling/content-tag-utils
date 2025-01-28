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
