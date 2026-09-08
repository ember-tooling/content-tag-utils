import { toTree, print } from "ember-estree";
import { stripBOM } from "./bom.js";

/**
 * The subset of ESTree that unprocess reads.
 * ember-estree types nodes with an index signature, which the strict
 * tsconfig rejects for dotted property access.
 *
 * @typedef {object} Node
 * @property {string} type
 * @property {Node} [program]
 * @property {Node[]} [body]
 * @property {Node} [expression]
 * @property {Node} [source]
 * @property {unknown} [value]
 * @property {Node[]} [specifiers]
 * @property {Node} [imported]
 * @property {Node} [local]
 * @property {string} [name]
 * @property {Node} [callee]
 * @property {Node[]} [arguments]
 * @property {Node[]} [quasis]
 * @property {string} [raw]
 */

const TEMPLATE_COMPILER = "@ember/template-compiler";

/**
 * @param {string} plain the processed JS or TS
 * @return {string}
 */
export function unprocess(plain) {
  // ember-estree drops it on the reprint too, but this keeps it ours.
  plain = stripBOM(plain);

  /** @type {Set<string>} */
  const templateFns = new Set();

  const tree = /** @type {import('ember-estree').FileNode} */ (
    toTree(plain, {
      filePath: "unprocess.ts",
      visitors: (outerAst) => {
        const program = /** @type {Node} */ (
          /** @type {Node} */ (outerAst).program
        );

        program.body = (program.body ?? []).filter((node) => {
          const localName = templateImportName(node);

          if (!localName) return true;

          templateFns.add(localName);
          return false;
        });

        return {
          StaticBlock(node, path) {
            const body = /** @type {Node} */ (node).body ?? [];
            const statement = body[0];

            if (body.length !== 1) return;
            if (statement?.type !== "ExpressionStatement") return;
            if (!statement.expression) return;

            const contents = templateContents(
              statement.expression,
              templateFns,
            );

            if (contents === undefined) return;

            replaceInParent(path.parent, node, templateNode(contents));
          },
          CallExpression(node, path) {
            const contents = templateContents(
              /** @type {Node} */ (node),
              templateFns,
            );

            if (contents === undefined) return;

            replaceInParent(path.parent, node, templateNode(contents));
          },
        };
      },
    })
  );

  if (tree.errors.length) {
    const messages = tree.errors.map((error) => error.message).join("\n");

    throw new SyntaxError(`unprocess: could not parse input:\n${messages}`);
  }

  return print(tree);
}

/**
 * The local name of `template` when the node imports it from
 * `@ember/template-compiler`.
 *
 * @param {Node} node
 * @return {string | undefined}
 */
function templateImportName(node) {
  if (node.type !== "ImportDeclaration") return;
  if (node.source?.value !== TEMPLATE_COMPILER) return;

  const specifier = (node.specifiers ?? []).find(
    (x) => x.type === "ImportSpecifier" && x.imported?.name === "template",
  );

  return specifier?.local?.name;
}

/**
 * The raw template source when the node is a `template(`...`)` call.
 *
 * @param {Node} node
 * @param {Set<string>} templateFns
 * @return {string | undefined}
 */
function templateContents(node, templateFns) {
  if (node.type !== "CallExpression") return;
  if (node.callee?.type !== "Identifier") return;
  if (!templateFns.has(node.callee.name ?? "")) return;

  const first = node.arguments?.[0];

  if (first?.type !== "TemplateLiteral") return;

  const value = /** @type {Node | undefined} */ (first.quasis?.[0]?.value);

  return value?.raw;
}

/**
 * A `<template>` node that prints its contents verbatim.
 * The contents are not parsed as Glimmer, so the original text stays as is.
 *
 * @param {string} contents
 * @return {import('ember-estree').ASTNode}
 */
function templateNode(contents) {
  return {
    type: "GlimmerTemplate",
    body: [{ type: "GlimmerTextNode", chars: contents }],
  };
}

/**
 * @param {import('ember-estree').ASTNode | null} parent
 * @param {import('ember-estree').ASTNode} target
 * @param {import('ember-estree').ASTNode} replacement
 */
function replaceInParent(parent, target, replacement) {
  if (!parent) return;

  for (const key of Object.keys(parent)) {
    const value = parent[key];

    if (value === target) {
      parent[key] = replacement;
      return;
    }

    if (Array.isArray(value)) {
      const index = value.indexOf(target);

      if (index >= 0) {
        value[index] = replacement;
        return;
      }
    }
  }
}
