import { describe, it, expect } from "vitest";
import { transform } from "content-tag-utils";
import { unicodeMulti } from "./helpers.js";

it("can remove contents", async () => {
  let result = await transform(unicodeMulti, () => "x");

  expect(result).toMatchInlineSnapshot(`
    "export const Run = <template>x</template>;

    export const Poo = <template>x</template>;

    export const Greeting = <template>
      Hello, <Name @name={{@name}} />!
      <R<template>x</template>"
  `);
});

describe("zalgo", () => {
  it("can replace with unicode", async () => {
    let result = await transform(unicodeMulti, () => "h̴̡̼͈̱͓͔͔͕̟̜̠̤̬̖͌̃͌͋í̸̺̥͉̼͛̽̐̈́̇̄̄̉̚͝");

    expect(result).toMatchInlineSnapshot(`
    "export const Run = <template>h̴̡̼͈̱͓͔͔͕̟̜̠̤̬̖͌̃͌͋í̸̺̥͉̼͛̽̐̈́̇̄̄̉̚͝</template>;

    export const Poo = <template>h̴̡̼͈̱͓͔͔͕̟̜̠̤̬̖͌̃͌͋í̸̺̥͉̼͛̽̐̈́̇̄̄̉̚͝</template>;

    export const Greeting = <template>
      H<template>h̴̡̼͈̱͓͔͔͕̟̜̠̤̬̖͌̃͌͋í̸̺̥͉̼͛̽̐̈́̇̄̄̉̚͝</template>"
  `);
  });
});

describe("korean", () => {
  it("can replace with unicode", async () => {
    let result = await transform(unicodeMulti, () => "ㄱ");

    expect(result).toMatchInlineSnapshot(`
      "export const Run = <template>ㄱ</template>;

      export const Poo = <template>ㄱ</template>;

      export const Greeting = <template>ㄱ</template>"
    `);
  });
});
