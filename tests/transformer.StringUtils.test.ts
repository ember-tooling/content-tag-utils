import { describe, it, expect } from "vitest";
import { ParseResultStringUtils } from "content-tag-utils";
import { Preprocessor } from "content-tag";

const p = new Preprocessor();

function create(content: string) {
  let buffer = Buffer.from(content, "utf8");

  return {
    stringUtils: new ParseResultStringUtils(buffer),
    parseResults: p.parse(content),
  };
}

let simpleTemplate = [
  "export const Name = <template>",
  "  {{@name}}",
  "</template>;",
  "",
  "export const Greeting = <template>",
  "  Hello, <Name @name={{@name}} />!",
  "</template>;",
  "",
].join("\n");

describe("StringUtils", () => {
  describe("contentBefore", () => {
    it("works", () => {
      let x = create(simpleTemplate);

      let result = x.stringUtils.contentBefore(x.parseResults[0]!);
      let result2 = x.stringUtils.contentBefore(x.parseResults[1]!);

      expect(result).toMatchInlineSnapshot(`"export const Name = "`);
      expect(result2).toMatchInlineSnapshot(`
        "export const Name = <template>
          {{@name}}
        </template>;

        export const Greeting = "
      `);
    });
  });

  describe("originalContentOf", () => {
    it("works", () => {
      let x = create(simpleTemplate);

      let result = x.stringUtils.originalContentOf(x.parseResults[0]!);
      let result2 = x.stringUtils.originalContentOf(x.parseResults[1]!);

      expect(result).toMatchInlineSnapshot(`
        "
          {{@name}}
        "
      `);
      expect(result2).toMatchInlineSnapshot(`
        "
          Hello, <Name @name={{@name}} />!
        "
      `);
    });
  });
  describe("openingTag", () => {
    it("works", () => {
      let x = create(simpleTemplate);

      let result = x.stringUtils.openingTag(x.parseResults[0]!);
      let result2 = x.stringUtils.openingTag(x.parseResults[1]!);

      expect(result).toMatchInlineSnapshot(`"<template>"`);
      expect(result2).toMatchInlineSnapshot(`"<template>"`);
    });
  });
  describe("closingTag", () => {
    it("works", () => {
      let x = create(simpleTemplate);

      let result = x.stringUtils.closingTag(x.parseResults[0]!);
      let result2 = x.stringUtils.closingTag(x.parseResults[1]!);

      expect(result).toMatchInlineSnapshot(`"</template>"`);
      expect(result2).toMatchInlineSnapshot(`"</template>"`);
    });
  });
});
