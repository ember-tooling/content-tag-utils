import { parse } from "./parse.js";

/**
 * Transforms all <template>s in a gjs/gts file.
 * Allows transforming them out of appearance-order.
 *
 * For async, all transforms are ran in "parallel".
 *
 * To get the result, the caller must call .toString()
 */
export class Transformer {
  /** @type {string} */
  #originalSource;
  /** @type {ReturnType<typeof parse>} */
  #parseResults;
  /** @type {Buffer} */
  #buffer;

  /** @type {ParseResultStringUtils} */
  #stringUtils;

  /**
   * For each template (parsed info),
   * keep track of the offsets prior to it
   *
   * @type {Map<object, string>}
   */
  #transforms = new Map();

  /**
   * @param {string} source
   */
  constructor(source) {
    this.#originalSource = source;
    this.#parseResults = parse(source);
    this.#buffer = Buffer.from(source, "utf8");
    this.#stringUtils = new ParseResultStringUtils(this.#buffer);
  }

  get parseResult() {
    return this.#parseResults;
  }

  /**
   * @param {(original: string) => string} perTemplateTransform
   */
  transformAllSync(perTemplateTransform) {
    for (let parseResult of this.#parseResults) {
      this.transformOneSync(parseResult, perTemplateTransform);
    }
  }

  /**
   * @param {(previous: string) => Promise<string> | string} perTemplateTransform
   */
  async transformAll(perTemplateTransform) {
    let promises = this.#parseResults.map((parseResult) =>
      this.transformOne(parseResult, perTemplateTransform),
    );

    await Promise.all(promises);
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @param {(previous: string) => string} transform
   * @return { void }
   */
  transformOneSync(parseResult, transform) {
    let previous =
      this.#transforms.get(parseResult) ??
      this.#stringUtils.originalContentOf(parseResult);

    let transformed = transform(previous);
    this.#transforms.set(parseResult, transformed);
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @param {(old: string) => Promise<string> | string} transform
   * @return { Promise<void> }
   */
  async transformOne(parseResult, transform) {
    let previous =
      this.#transforms.get(parseResult) ??
      this.#stringUtils.originalContentOf(parseResult);

    let transformed = await transform(previous);
    this.#transforms.set(parseResult, transformed);
  }

  /**
   * Returns the  whole gjs/gts document with the transforms written in to it
   */
  toString() {
    let result = this.#originalSource;
    let offset = 0;

    /**
     * Apply recorded transforms
     */
    for (let parseResult of this.#parseResults) {
      let transformed = this.#transforms.get(parseResult);

      if (!transformed) {
        continue;
      }

      let originalContent = this.#stringUtils.originalContentOf(parseResult);
      let originalLength = originalContent.length;
      let originalBeforeContent = this.#stringUtils.contentBefore(parseResult);
      let originalStart = originalBeforeContent.length;
      let originalEnd = originalStart + originalLength;

      let openingTag = this.#stringUtils.openingTag(parseResult);
      let closingTag = this.#stringUtils.closingTag(parseResult);

      result =
        result.slice(0, originalStart + offset) +
        openingTag +
        transformed +
        closingTag +
        result.slice(originalEnd + offset, result.length);

      offset = transformed.length - originalLength;
    }

    return result;
  }
}

class ParseResultStringUtils {
  /** @type {Buffer} */
  #buffer;

  /**
   * @param {Buffer} buffer
   */
  constructor(buffer) {
    this.#buffer = buffer;
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   */
  contentBefore(parseResult) {
    return this.#buffer.slice(0, parseResult.range.start).toString();
  }

  /**
   * NOTE: range.start w/ range.end is between the <template> and </template>
   *
   * @param {ReturnType<typeof parse>[0]} parseResult
   */
  originalContentOf(parseResult) {
    return this.#buffer
      .slice(parseResult.range.start, parseResult.range.end)
      .toString();
  }

  /**
   * Need to make sure the opening <template> and closing </template>
   * are not removed.
   *
   * We aren't just using the strings <template> and </template>, because
   * its possible for the opening <template ..... > to have attributes in the future
   * with futher syntax extensions
   * - Signature
   * - defaults?
   * - macros?
   */
  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   */
  openingTag(parseResult) {
    let openingTag = this.#buffer
      .slice(parseResult.startRange.start, parseResult.startRange.end)
      .toString();
    return openingTag;
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   */
  closingTag(parseResult) {
    let closingTag = this.#buffer
      .slice(parseResult.endRange.start, parseResult.endRange.end)
      .toString();
    return closingTag;
  }
}
