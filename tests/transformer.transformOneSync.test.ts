import { it, expect } from "vitest";
import { Transformer } from "content-tag-utils";
import {
  inAClass,
  multiTemplate,
  multiWithClass,
  simpleTest,
} from "./helpers.js";

it("noop", () => {
  let t = new Transformer(simpleTest);
  let coords;

  t.transformOneSync(t.parseResults[0]!, (x, c) => {
    coords = c;
    return x;
  });

  expect(coords).toMatchInlineSnapshot(`
    {
      "column": 25,
      "columnOffset": 2,
      "end": 135,
      "line": 2,
      "start": 64,
    }
  `);
  expect(t.toString()).toMatchInlineSnapshot(`
    "test('it renders', async (assert) => {
      await render(<template>
        <div class="parent">
          <div class="child"></div>
        </div>
      </template>);
    });"
  `);
});

it("small replace", () => {
  let t = new Transformer(simpleTest);

  let coords;

  t.transformOneSync(t.parseResults[0]!, (_x, c) => {
    coords = c;
    return 'x';
  });

  expect(coords).toMatchInlineSnapshot(`
    {
      "column": 25,
      "columnOffset": 2,
      "end": 135,
      "line": 2,
      "start": 64,
    }
  `);
  expect(t.toString()).toMatchInlineSnapshot(`
    "test('it renders', async (assert) => {
      await render(<template>x</template>);
    });"
  `);
});

it("multiple small replace", () => {
  let t = new Transformer(multiTemplate);

  let coords;


  t.transformOneSync(t.parseResults[1]!, () => {
    return 'second  first';
  });
  t.transformOneSync(t.parseResults[0]!, (_x, c) => {
    coords = c;
    return 'x';
  });

  expect(coords).toMatchInlineSnapshot(`
    {
      "column": 30,
      "columnOffset": 0,
      "end": 43,
      "line": 1,
      "start": 30,
    }
  `);
  expect(t.toString()).toMatchInlineSnapshot(`
    "export const Name = <template>x</template>;

    export const Greeting = <template>second  first</template>;
    "
  `);
});

it("class small replace", () => {
  let t = new Transformer(inAClass);

  let coords;

  t.transformOneSync(t.parseResults[0]!, (_x, c) => {
    coords = c;
    return 'x';
  });

  expect(coords).toMatchInlineSnapshot(`
    {
      "column": 12,
      "columnOffset": 2,
      "end": 73,
      "line": 2,
      "start": 31,
    }
  `);
  expect(t.toString()).toMatchInlineSnapshot(`
    "export class Foo {
      <template>x</template>
    }
    "
  `);
});

it("class w/ to small replace", () => {
  let t = new Transformer(multiWithClass);

  let coords;

  t.transformOneSync(t.parseResults[0]!, (_x, c) => {
    coords = c;
    return 'x';
  });

  expect(coords).toMatchInlineSnapshot(`
    {
      "column": 12,
      "columnOffset": 2,
      "end": 73,
      "line": 2,
      "start": 31,
    }
  `);
  expect(t.toString()).toMatchInlineSnapshot(`
    "export class Foo {
      <template>x</template>
    }

    export const Greeting = <template>
      <fieldset>
        <legend>Greeting</legend>
        <Foo />!
      </fieldset>
    </template>;
    "
  `);
});
