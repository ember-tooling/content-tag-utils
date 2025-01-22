import { parse } from "./parse.js";
import { replaceTemplates } from "./replate-templates.js";

/**
 * @param {string} source
 * @param {(innerTemplateContents: string) => string} callback
 */
export function transform(source, callback) {
  let templates = parse(source);

  return replaceTemplates(source, templates, callback);
}
