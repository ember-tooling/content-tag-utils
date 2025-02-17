/**
 * @typedef { import('./public-types.ts').Coordinates} Coordinates
 * @typedef { ReturnType<typeof parse>[0] } ParseResult;
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
   * @type {Map<ParseResult, Coordinates>}
   */
  #coordinates = new Map();

  /**
   * Map of coordinates to parse results
   *
   * @type {Map<Coordinates, ParseResult>}
   */
  #reverseCoordinates = new Map();

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
      this.#reverseCoordinates.set(coordinates, parseResult);
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
   * For a given set of coordinates, find the parseResult and return it
   * You don't need to provide the whole original coordinates object.
   * Though, you can!
   *
   * Alternatively, you can pass line/column or start or end
   *
   * @param {Partial<Coordinates> | Coordinates} coordinates
   * @returns {ParseResult | undefined}
   */
  parseResultAt(coordinates) {
    let candidates = [...this.#coordinates.values()];
    let match = candidates.find((x) => x === coordinates);

    if (!match && isPresent(coordinates.start)) {
      match = candidates.find((x) => x.start === coordinates.start);
    }

    if (!match && isPresent(coordinates.end)) {
      match = candidates.find((x) => x.end === coordinates.end);
    }

    if (
      !match &&
      isPresent(coordinates.line) &&
      isPresent(coordinates.column)
    ) {
      match = candidates.find(
        (x) => x.line === coordinates.line && x.column === coordinates.column,
      );
    }

    if (match) {
      return this.#reverseCoordinates.get(match);
    }

    return;
  }

  /**
   * Synchronously iterate over all of the templates
   *
   * @param {(original: string, coordinates: Coordinates) => unknown} perTemplate
   */
  each(perTemplate) {
    for (let parseResult of this.#parseResults) {
      this.#assertParseResult(parseResult);

      let previous =
        this.#transforms.get(parseResult) ??
        this.#stringUtils.originalContentOf(parseResult);

      let coordinates = this.#getCoordinates(parseResult);

      perTemplate(previous, coordinates);
    }
  }

  /**
   * Asynchronously iterate over all of the templates
   *
   * @param {(original: string, coordinates: Coordinates) => unknown} perTemplate
   */
  async asyncEach(perTemplate) {
    for (let parseResult of this.#parseResults) {
      await this.#handleCallback(parseResult, perTemplate);
    }
  }

  /**
   * Map over all templates in the document, replacing their contents with the return string value from the provided callback;
   *
   * @param {(original: string, coordinates: Coordinates) => string} eachTemplate
   */
  map(eachTemplate) {
    for (let parseResult of this.#parseResults) {
      this.transformOneSync(parseResult, eachTemplate);
    }
  }

  /**
   * Map over all templates in the document, replacing their contents with the return string value from the provided async callback;
   *
   * @param {(original: string, coordinates: Coordinates) => Promise<string> | string} eachTemplate
   */
  async asyncMap(eachTemplate) {
    let promises = this.#parseResults.map((parseResult) =>
      this.transformOne(parseResult, eachTemplate),
    );

    await Promise.all(promises);
  }

  /**
   * Transform one template
   *
   * @template Return
   * @param {ParseResult} parseResult
   * @param {(previous: string, coordinates: Coordinates) => Return} transform
   * @return {Return}
   */
  #handleCallback(parseResult, transform) {
    this.#assertParseResult(parseResult);

    let previous =
      this.#transforms.get(parseResult) ??
      this.#stringUtils.originalContentOf(parseResult);

    let coordinates = this.#getCoordinates(parseResult);

    return transform(previous, coordinates);
  }

  /**
   * Transform one template
   *
   * @param {ParseResult} parseResult
   * @param {(previous: string, coordinates: Coordinates) => string} transform
   * @return { void }
   */
  transformOneSync(parseResult, transform) {
    let transformed = this.#handleCallback(parseResult, transform);
    this.#transforms.set(parseResult, transformed);
  }

  /**
   * Transform one template
   *
   * @param {ParseResult} parseResult
   * @param {(previous: string, coordinates: Coordinates) => Promise<string> | string} transform
   * @return { Promise<void> }
   */
  async transformOne(parseResult, transform) {
    let transformed = await this.#handleCallback(parseResult, transform);
    this.#transforms.set(parseResult, transformed);
  }

  /**
   * @param {ParseResult} parseResult
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
   * @param {ParseResult} parseResult
   * @return {ParseResult} parseResult
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
   * @param {ParseResult} parseResult
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
        transformed.toString() +
        closingTag +
        result.slice(originalEnd + offset, result.length);

      offset += transformed.length - originalLength;
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
   * @param {ParseResult} parseResult
   */
  contentBefore(parseResult) {
    return this.#buffer.slice(0, parseResult.range.start).toString();
  }

  /**
   * @param {ParseResult} parseResult
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
   * @param {ParseResult} parseResult
   */
  openingTag(parseResult) {
    let openingTag = this.#buffer
      .slice(parseResult.startRange.start, parseResult.startRange.end)
      .toString();
    return openingTag;
  }

  /**
   * @param {ParseResult} parseResult
   */
  closingTag(parseResult) {
    let closingTag = this.#buffer
      .slice(parseResult.endRange.start, parseResult.endRange.end)
      .toString();
    return closingTag;
  }
}

/**
 * @template Value
 * @param {Value} x
 * @returns {x is NonNullable<Value>}
 */
function isPresent(x) {
  return x !== null && x !== undefined;
}
