/**
 * Other tools that we use that strip the BOM:
 * - SWC (via content-tag):
 *   https://github.com/swc-project/swc/blob/0dffdc4998a5b8605de8f07fb0518bc60495a931/crates/swc_common/src/source_map.rs#L1203-L1207
 */

const BOM = 0xfeff;

/**
 * Removes a leading BOM.
 *
 * Strings are stripped of every leading BOM, since they are about to be parsed
 * and swc will have nothing left to strip. Buffers are stripped of exactly one,
 * matching what swc already did to the source the byte offsets came from.
 *
 * @internal
 * @overload
 * @param {string} source
 * @returns {string}
 */
/**
 * @internal
 * @overload
 * @param {Buffer} source
 * @returns {Buffer}
 */
/**
 * @internal
 * @param {string | Buffer} source
 * @returns {string | Buffer}
 */
export function stripBOM(source) {
  if (typeof source === "string") {
    let start = 0;

    while (source.charCodeAt(start) === BOM) {
      start++;
    }

    return start === 0 ? source : source.slice(start);
  }

  const hasBom = source[0] === 0xef && source[1] === 0xbb && source[2] === 0xbf;

  return hasBom ? source.subarray(3) : source;
}
