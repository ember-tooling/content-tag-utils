export const simpleTest = [
  "test('it renders', async (assert) => {",
  "  await render(<template>",
  '    <div class="parent">',
  '      <div class="child"></div>',
  "    </div>",
  "  </template>);",
  "});",
].join("\n");

export const multiTemplate = [
  "export const Name = <template>",
  "  {{@name}}",
  "</template>;",
  "",
  "export const Greeting = <template>",
  "  Hello, <Name @name={{@name}} />!",
  "</template>;",
  "",
].join("\n");

export const inAClass = [
  "export class Foo {",
  "  <template>",
  "    hello there",
  "    {{log globalThis}}",
  "  </template>",
  "}",
  "",
].join("\n");

export const multiWithClass = [
  "export class Foo {",
  "  <template>",
  "    hello there",
  "    {{log globalThis}}",
  "  </template>",
  "}",
  "",
  "export const Greeting = <template>",
  "  <fieldset>",
  "    <legend>Greeting</legend>",
  "    <Foo />!",
  "  </fieldset>",
  "</template>;",
  "",
].join("\n");
