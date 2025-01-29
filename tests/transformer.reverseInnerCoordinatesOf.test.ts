import { it, expect } from "vitest";
import { Transformer } from "content-tag-utils";

it("gives me the value for the README", () => {
  let file = `
export const Foo = <template>
    Hello there
</template>
`;
  const innerCoordinates = {
    line: 2,
    column: 4,
    endColumn: 5,
    endLine: 2,
  };

  let t = new Transformer(file);
  const result = t.reverseInnerCoordinatesOf(
    t.parseResults[0]!,
    innerCoordinates,
  );

  expect(result).toMatchInlineSnapshot(`
      {
        "column": 4,
        "endColumn": 5,
        "endLine": 3,
        "line": 3,
      }
    `);
});

it("transforms the coordinates", () => {
  let js = "<template>{{book}}</template>";
  //                    ^ Error here. This isn't defined
  // Example -- pointing at ^ range made by the node representing `book`
  const lintResult = {
    column: 2,
    endColumn: 6,
    endLine: 1,
    line: 1,
  };
  let t = new Transformer(js);
  const result = t.reverseInnerCoordinatesOf(t.parseResults[0]!, lintResult);

  expect(result.line).toBe(1);
  expect(result.endLine).toBe(1);
  expect(result.column).toBe(12);
});
