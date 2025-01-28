/**
 * @param {unknown} test
 * @param {string} message
 * @returns {asserts test is true}
 */
export function assert(test, message) {
  if (!test) {
    throw new Error(message);
  }
}
