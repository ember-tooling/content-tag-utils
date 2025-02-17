import { it, expect } from "vitest";
import { Transformer } from "content-tag-utils";

let file = `
export const Foo = <template>
    Hello there
</template>;

export const Bar = <template>Greeting</template>;

export const Baz = <template>
  Ope
</template>;
`;

let t = new Transformer(file);

let coords: Parameters<Parameters<typeof t.each>[0]>[1][] = [];

t.each((_, c) => {
  coords.push(c);
});

it("no match", () => {
  const result = t.parseResultAt({ start: 20 });

  expect(result).toMatchInlineSnapshot(`undefined`);
});

for (let scenario of coords) {
  it(`matches start ${scenario.start}`, () => {
    const result = t.parseResultAt({ start: scenario.start });

    expect(result?.contentRange?.start).toEqual(scenario.start);
  });

  it(`matches end ${scenario.end}`, () => {
    const result = t.parseResultAt({ end: scenario.end });

    expect(result?.contentRange?.end).toEqual(scenario.end);
  });

  it(`matches whole thing ${scenario.start}`, () => {
    const result = t.parseResultAt(scenario);

    expect(result?.contentRange?.end).toEqual(scenario.end);
  });

  it(`matches line and column ${scenario.line} ${scenario.column}`, () => {
    const result = t.parseResultAt({
      line: scenario.line,
      column: scenario.column,
    });

    expect(result?.contentRange?.end).toEqual(scenario.end);
  });
}
