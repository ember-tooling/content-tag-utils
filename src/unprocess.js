import jscodeshift from "jscodeshift";

/**
 * @param {string} plain the processed JS or TS
 * @return {string}
 */
export function unprocess(plain) {
  const j = jscodeshift.withParser("ts");
  /** @type {string[]} */
  const templateFns = [];
  const root = j(plain);

  // @ts-expect-error
  function getTemplate(path) {
    let result;

    j(path).forEach((path) => {
      if (!("name" in path.node.callee)) {
        return;
      }

      let name = path.node.callee.name;

      if (typeof name !== "string") {
        return;
      }

      if (templateFns.includes(name)) {
        let first = path.node.arguments[0];

        if (!first || first?.type !== "TemplateLiteral") {
          return;
        }

        let contents = first.quasis?.[0]?.value.raw;

        result = contents;
      }
    });

    return result;
  }

  root
    .find(j.ImportDeclaration, {
      source: {
        value: "@ember/template-compiler",
      },
    })
    .forEach((path) => {
      let template = path.node.specifiers?.find((x) => {
        if ("imported" in x) {
          return x.imported.name === "template";
        }
        return;
      });

      if (template?.local) {
        templateFns.push(template.local.name);
        j(path).remove();
      }
    });

  root.find(j["StaticBlock"]).forEach((staticPath) => {
    // @ts-expect-error
    j(staticPath)
      .find(j.CallExpression)
      .forEach((path) => {
        let contents = getTemplate(path);

        if (!contents) return;

        // @ts-expect-error
        j(staticPath).replaceWith(`<template>${contents}</template>`);
      });
  });

  root.find(j.CallExpression).forEach((path) => {
    let contents = getTemplate(path);

    if (!contents) return;

    j(path).replaceWith(`<template>${contents}</template>`);
  });

  return root.toSource();
}
