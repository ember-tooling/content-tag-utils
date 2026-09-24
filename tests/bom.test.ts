import { describe, it, expect } from "vitest";
import {
  transform,
  transformSync,
  coordinatesOf,
  Transformer,
  ParseResultStringUtils,
} from "content-tag-utils";
import { unprocess } from "content-tag-utils/unprocess";
import { Preprocessor } from "content-tag";
import { BOM } from "./helpers.js";

const p = new Preprocessor();

/**
 * A leading BOM is not part of the source. Nothing hands one back, and every
 * coordinate is measured without it.
 */
const source = "export const Foo = <template>Hello there</template>\n";

describe("transformSync", () => {
  it("hands the callback the template contents, not a shifted window", () => {
    const seen: string[] = [];

    transformSync(BOM + source, (contents) => {
      seen.push(contents);

      return contents;
    });

    expect(seen).to.deep.equal(["Hello there"]);
  });

  it("applies the transform and returns the source without the BOM", () => {
    const result = transformSync(BOM + source, (contents) =>
      contents.replace("Hello there", "Goodbye"),
    );

    expect(result).to.equal(
      "export const Foo = <template>Goodbye</template>\n",
    );
  });

  it("strips the BOM even when the transform changes nothing", () => {
    const result = transformSync(BOM + source, (contents) => contents);

    expect(result).to.equal(source);
  });
});

describe("transform", () => {
  it("returns the source without the BOM", async () => {
    const result = await transform(BOM + source, (contents) => contents);

    expect(result).to.equal(source);
  });
});

describe("Transformer", () => {
  it("toString() returns the source without the BOM", () => {
    const t = new Transformer(BOM + source);

    t.map((contents) => contents.replace("Hello there", "Goodbye"));

    expect(t.toString()).to.equal(
      "export const Foo = <template>Goodbye</template>\n",
    );
  });

  it("toStringWithTemplatePlaceholders() returns no BOM", () => {
    const t = new Transformer(BOM + source);

    expect(t.toStringWithTemplatePlaceholders()).to.equal(
      "export const Foo = TEMPLATE_TEMPLATE(`Hello there`)\n",
    );
  });

  it("each() yields contents and coordinates that index the stripped source", () => {
    const t = new Transformer(BOM + source);
    const seen: Array<[string, number, number]> = [];

    t.each((contents, coordinates) => {
      seen.push([contents, coordinates.start, coordinates.end]);
    });

    const [entry] = seen;

    expect(entry?.[0]).to.equal("Hello there");
    expect(source.slice(entry?.[1], entry?.[2])).to.equal("Hello there");
  });
});

describe("coordinatesOf", () => {
  it("reports the same coordinates as the same file without a BOM", () => {
    const withBom = BOM + source;

    const plain = coordinatesOf(source, p.parse(source)[0]!);
    const bommed = coordinatesOf(withBom, p.parse(withBom)[0]!);

    expect(bommed).to.deep.equal(plain);
  });

  it("returns indices into the stripped source", () => {
    const withBom = BOM + source;

    const result = coordinatesOf(withBom, p.parse(withBom)[0]!);

    expect(source.slice(result.start, result.end)).to.equal("Hello there");
  });

  it("does not count the BOM as indentation", () => {
    // trimStart() counts U+FEFF as whitespace, so a BOM left in place reads
    // as a column of indent.
    const indentable = `${BOM}<template>hi</template>`;

    const result = coordinatesOf(indentable, p.parse(indentable)[0]!);

    expect(result.column).to.equal(10);
    expect(result.columnOffset).to.equal(0);
  });

  it("accepts a Buffer whose bytes open with a BOM", () => {
    const buffer = Buffer.from(BOM + source, "utf8");

    const result = coordinatesOf(buffer, p.parse(BOM + source)[0]!);

    expect(result).to.deep.equal(coordinatesOf(source, p.parse(source)[0]!));
  });
});

describe("ParseResultStringUtils", () => {
  it("slices past the BOM in the buffer it was given", () => {
    const withBom = BOM + source;
    const stringUtils = new ParseResultStringUtils(
      Buffer.from(withBom, "utf8"),
    );
    const parseResult = p.parse(withBom)[0]!;

    expect(stringUtils.originalContentOf(parseResult)).to.equal("Hello there");
    expect(stringUtils.contentBefore(parseResult)).to.equal(
      "export const Foo = ",
    );
    expect(stringUtils.openingTag(parseResult)).to.equal("<template>");
    expect(stringUtils.closingTag(parseResult)).to.equal("</template>");
  });
});

describe("more than one leading BOM", () => {
  // content-tag only strips one, so whoever owns the parse strips the rest.
  it("transformSync applies the transform and returns no BOM", () => {
    const result = transformSync(BOM + BOM + source, (contents) =>
      contents.replace("Hello there", "Goodbye"),
    );

    expect(result).to.equal(
      "export const Foo = <template>Goodbye</template>\n",
    );
  });

  it("transformSync leaves the document intact when nothing changes", () => {
    const result = transformSync(BOM + BOM + BOM + source, (c) => c);

    expect(result).to.equal(source);
  });

  it("Transformer coordinates index its own output", () => {
    const t = new Transformer(BOM + BOM + source);
    const output = t.toString();

    t.each((contents, coordinates) => {
      expect(output.slice(coordinates.start, coordinates.end)).to.equal(
        contents,
      );
      expect(coordinates.columnOffset).to.equal(0);
    });
  });
});

describe("a BOM on other document shapes", () => {
  const inAClass = [
    "export class Foo {",
    "  <template>",
    "    hello there",
    "  </template>",
    "}",
    "",
  ].join("\n");

  const multi = [
    "export const A = <template>first</template>;",
    "export const B = <template>second</template>;",
    "",
  ].join("\n");

  it("keeps the indentation of a class member template", () => {
    const withBom = BOM + inAClass;

    const plain = coordinatesOf(inAClass, p.parse(inAClass)[0]!);
    const bommed = coordinatesOf(withBom, p.parse(withBom)[0]!);

    expect(bommed).to.deep.equal(plain);
    expect(bommed.columnOffset).to.equal(2);
  });

  it("transforms a class member template", () => {
    const result = transformSync(BOM + inAClass, () => "replaced");

    expect(result).to.equal(transformSync(inAClass, () => "replaced"));
  });

  it("uses the class member placeholder", () => {
    const t = new Transformer(BOM + inAClass);

    expect(t.toStringWithTemplatePlaceholders()).to.equal(
      new Transformer(inAClass).toStringWithTemplatePlaceholders(),
    );
  });

  it("transforms every template in a multi template document", () => {
    const result = transformSync(BOM + multi, (contents) =>
      contents.toUpperCase(),
    );

    expect(result).to.equal(
      [
        "export const A = <template>FIRST</template>;",
        "export const B = <template>SECOND</template>;",
        "",
      ].join("\n"),
    );
  });
});

describe("unprocess", () => {
  it("returns the source without the BOM", () => {
    const processed = [
      `import { template } from "@ember/template-compiler";`,
      "export const Foo = template(`Hello there`);",
      "",
    ].join("\n");

    expect(unprocess(BOM + processed)).to.equal(unprocess(processed));
    expect(unprocess(BOM + processed)).to.equal(
      "export const Foo = <template>Hello there</template>;",
    );
  });
});
