import { it, expect } from "vitest";
import { Transformer } from "content-tag-utils";
import {
  inAClass,
  multiTemplate,
  multiWithClass,
  simpleTest,
} from "./helpers.js";

it("noop", async () => {
  let t = new Transformer(simpleTest);

  await t.transformAll((x) => x);

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

it("small replace", async () => {
  let t = new Transformer(simpleTest);

  await t.transformAll(() => Promise.resolve("x"));

  expect(t.toString()).toMatchInlineSnapshot(`
    "test('it renders', async (assert) => {
      await render(<template>x</template>);
    });"
  `);
});

it("multiple small replace", async () => {
  let t = new Transformer(multiTemplate);

  await t.transformAll(() => Promise.resolve("x"));

  expect(t.toString()).toMatchInlineSnapshot(`
    "export const Name = <template>x</template>;

    export const Greeting = <template>x</template>;
    "
  `);
});

it("class small replace", async () => {
  let t = new Transformer(inAClass);

  await t.transformAll(() => Promise.resolve("x"));

  expect(t.toString()).toMatchInlineSnapshot(`
    "export class Foo {
      <template>x</template>
    }
    "
  `);
});

it("class w/ to small replace", async () => {
  let t = new Transformer(multiWithClass);

  await t.transformAll(() => Promise.resolve("x"));

  expect(t.toString()).toMatchInlineSnapshot(`
    "export class Foo {
      <template>x</template>
    }

    export const Greeting = <template>x</template>;
    "
  `);
});
