import { it, expect } from "vitest";
import { Transformer } from "content-tag-utils";
import { simpleTest } from "./helpers.js";
import { Coordinates } from "../src/public-types.js";

it("callabck receives the template and coordinates", () => {
  let t = new Transformer(simpleTest);

  let captured: [string, Coordinates][] = [];
  t.each((...args) => captured.push(args));

  expect(captured).toMatchInlineSnapshot(`
    [
      [
        "
        <div class="parent">
          <div class="child"></div>
        </div>
      ",
        {
          "column": 25,
          "columnOffset": 2,
          "end": 135,
          "line": 2,
          "start": 64,
        },
      ],
    ]
  `);
});
