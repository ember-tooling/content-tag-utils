/**
 * @typedef { import('./public-types.ts').Coordinates} Coordinates
 */
import { reverseInnerCoordinates } from "./reverse-inner-coordinates.js";
import { coordinatesOf } from "./coordinates-of.js";
import { parse } from "./parse.js";
import { assert } from "./assert.js";

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
   * Map of coordinates to pass to each callback
   *
   * @type {Map<object, Coordinates>}
   */
  #coordinates = new Map();

  /**
   * @param {string} source
   */
  constructor(source) {
    this.#originalSource = source;

    let parsed = parse(source);
    let frozenParsed = parsed.map(Object.freeze);

    // SAFETY: readonly types are super annoying
    this.#parseResults = /** @type {ReturnType<typeof parse>} */ (frozenParsed);
    this.#buffer = Buffer.from(source, "utf8");
    this.#stringUtils = new ParseResultStringUtils(this.#buffer);

    for (let parseResult of this.#parseResults) {
      let coordinates = coordinatesOf(this.#buffer, parseResult);
      this.#coordinates.set(parseResult, coordinates);
    }
  }

  /**
   * Output from content-tag. Each of these is used as the key
   * for working with transforms, and getting coordinates.
   *
   * Mutating them is not allowed.
   */
  get parseResults() {
    return this.#parseResults;
  }

  /**
   * Synchronously run a transform on all of the templates
   *
   * @param {(original: string, coordinates: Coordinates) => string} perTemplateTransform
   */
  transformAllSync(perTemplateTransform) {
    for (let parseResult of this.#parseResults) {
      this.transformOneSync(parseResult, perTemplateTransform);
    }
  }

  /**
   * Asynchronously run a transform on all of the templates
   *
   * @param {(previous: string, coordinates: Coordinates) => Promise<string> | string} perTemplateTransform
   */
  async transformAll(perTemplateTransform) {
    let promises = this.#parseResults.map((parseResult) =>
      this.transformOne(parseResult, perTemplateTransform),
    );

    await Promise.all(promises);
  }

  /**
   * Transform one template
   *
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @param {(previous: string, coordinates: Coordinates) => string} transform
   * @return { void }
   */
  transformOneSync(parseResult, transform) {
    this.#assertParseResult(parseResult);

    let previous =
      this.#transforms.get(parseResult) ??
      this.#stringUtils.originalContentOf(parseResult);

    let coordinates = this.#getCoordinates(parseResult);

    let transformed = transform(previous, coordinates);
    this.#transforms.set(parseResult, transformed);
  }

  /**
   * Transform one template
   *
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @param {(previous: string, coordinates: Coordinates) => Promise<string> | string} transform
   * @return { Promise<void> }
   */
  async transformOne(parseResult, transform) {
    this.#assertParseResult(parseResult);

    let previous =
      this.#transforms.get(parseResult) ??
      this.#stringUtils.originalContentOf(parseResult);

    let coordinates = this.#getCoordinates(parseResult);

    let transformed = await transform(previous, coordinates);
    this.#transforms.set(parseResult, transformed);
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @return {Coordinates}
   */
  #getCoordinates(parseResult) {
    let coordinates = this.#coordinates.get(parseResult);

    assert(
      coordinates,
      `Expected coordinates to exist for passed parseResult, but they did not`,
    );
    return coordinates;
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @return {ReturnType<typeof parse>[0]} parseResult
   */
  #assertParseResult(parseResult) {
    assert(
      this.parseResults.includes(parseResult),
      `Expected passed parseResult to be from the set of parseResults originally created when instantiating this Transformer. Received some unknown object.`,
    );

    return parseResult;
  }

  /**
   * Given a parseResult, get the outer coordinates of some in-bounds coordinates
   * within the template represented by the parseResult.
   *
   * @param {ReturnType<typeof parse>[0]} parseResult
   * @param {import('./internal-types.ts').InnerCoordinates} innerCoordinates
   */
  reverseInnerCoordinatesOf(parseResult, innerCoordinates) {
    this.#assertParseResult(parseResult);
    let coordinates = this.#getCoordinates(parseResult);

    return reverseInnerCoordinates(coordinates, innerCoordinates);
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
      let originalContent = this.#stringUtils.originalContentOf(parseResult);
      let originalLength = originalContent.length;

      if (!transformed) {
        offset = 0 - originalLength;
        continue;
      }

      let originalBeforeContent = this.#stringUtils.contentBefore(parseResult);
      let originalStart = originalBeforeContent.length;

      let openingTag = this.#stringUtils.openingTag(parseResult);
      let closingTag = this.#stringUtils.closingTag(parseResult);

      let originalEnd =
        originalStart + openingTag.length + originalLength + closingTag.length;

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

/**
 * In a parseResult:
 * - range: full range, <template></template> inclusive
 * - contentRange: range between, <template></template> exclusive
 * - startRange: range of opening <template>
 * - endRange: range of closing </template>
 */
export class ParseResultStringUtils {
  /** @type {Buffer} */
  #buffer;

  /**
   * @param {Buffer} buffer
   */
  constructor(buffer) {
    this.#buffer = buffer;
  }

  /**
   * Content before the opening <template>
   *
   * @param {ReturnType<typeof parse>[0]} parseResult
   */
  contentBefore(parseResult) {
    return this.#buffer.slice(0, parseResult.range.start).toString();
  }

  /**
   * @param {ReturnType<typeof parse>[0]} parseResult
   */
  originalContentOf(parseResult) {
    return this.#buffer
      .slice(parseResult.contentRange.start, parseResult.contentRange.end)
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
