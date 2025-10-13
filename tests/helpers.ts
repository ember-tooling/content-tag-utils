export const simpleTest = [
  "test('it renders', async (assert) => {",
  "  await render(<template>",
  '    <div class="parent">',
  '      <div class="child"></div>',
  "    </div>",
  "  </template>);",
  "});",
].join("\n");

export const implicitDefault = {
  satisfies: `
import type { TOC } from '@ember/component/template-only';

<template>hi there</template> satisfies TOC<{
  /* ... */
}>`,
  js: `<template>hi</template>`,
};

export const unicodeSingle = [
  "export const Name = <template>",
  "  💩",
  "</template>;",
  "",
].join("\n");

export const withService = [
  "import { service } from '@ember/service';",
  "import Component from '@glimmer/component';",
  "",
  "export class ExampleComponent extends Component {",
  "  @service('store') store;",
  "  property = true;",
  "",
  "  ask() {",
  "    return 'hello world'",
  "  }",
  "",
  "  <template>",
  "    <h2>My Component</h2>",
  "  </template>",
  "}",
].join("\n");

export const unicodeMulti = [
  "export const Run = <template>",
  "  r̸̳͙̟̳̺̩̎̍̎̚͠ǘ̷̟̀͂̽̿̅̆̈́n̷̜̣̙̫̦̳͇̞̣̻͑̊̂́̿̈́̕͜͜͠ͅ",
  "</template>;",
  "",
  "export const Poo = <template>",
  "  💩",
  "</template>;",
  "",
  "export const Greeting = <template>",
  "  Hello, <Name @name={{@name}} />!",
  "  <Run />",
  "</template>;",
  "",
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

export const glimmer = [
  "import Component from '@glimmer/component';",
  "",
  "export default class Demo extends Component {",
  "  foo = 2;",
  "",
  "  <template>",
  "    {{this.foo}}",
  "  </template>",
  "}",
].join("\n");
