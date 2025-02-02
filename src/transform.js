import { Transformer } from "./transformer.js";

/**
 * Transforms each template within a gjs or gts file
 *
 * @param {string} source the original source
 * @param {(innerContent: string) => string} eachTemplate the function to run on each of the contents (omitting the outer `<template>` and `</template>` tags)
 * @return {string}
 */
export function transformSync(source, eachTemplate) {
  let t = new Transformer(source);

  t.map(eachTemplate);

  return t.toString();
}

/**
 * Transforms each template within a gjs or gts file
 *
 * @param {string} source the original source
 * @param {(innerContent: string) => string} eachTemplate the function to run on each of the contents (omitting the outer `<template>` and `</template>` tags)
 * @return {Promise<string>}
 */
export async function transform(source, eachTemplate) {
  let t = new Transformer(source);

  await t.asyncMap(eachTemplate);

  return t.toString();
}
