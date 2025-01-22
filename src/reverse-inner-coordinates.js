/**
 * @param {import('./internal-types.ts').TemplateCoordinates} templateCoordinates
 * @param {import('./internal-types.ts').InnerCoordinates} innerCoordinates
 */
export function reverseInnerCoordinates(templateCoordinates, innerCoordinates) {
  /**
   * Given the sample source code:
   * 1 export class SomeComponent extends Component<Args> {\n
   * 2     <template>\n
   * 3         {{debugger}}\n
   * 4     </template>\n
   * 5 }
   *
   * The extracted template will be:
   * 1 \n
   * 2    {{debugger}}\n
   *
   * The coordinates of the template in the source file are: { line: 3, column: 14 }.
   * The coordinates of the error in the template are: { line: 2, column: 4 }.
   *
   * Thus, we need to always subtract one before adding the template location.
   */
  const line = innerCoordinates.line + templateCoordinates.line - 1;
  const endLine = innerCoordinates.endLine + templateCoordinates.line - 1;

  /**
   * Given the sample source code:
   * 1 export class SomeComponent extends Component<Args> {\n
   * 2     <template>{{debugger}}\n
   * 3     </template>\n
   * 4 }
   *
   * The extracted template will be:
   * 1 {{debugger}}\n
   *
   * The coordinates of the template in the source file are: { line: 3, column: 14 }.
   * The coordinates of the error in the template are: { line: 1, column: 0 }.
   *
   * Thus, if the error is found on the first line of a template,
   * then we need to add the column location to the result column location.
   *
   * Any result > line 1 will not require any column correction.
   */
  const column =
    innerCoordinates.line === 1
      ? innerCoordinates.column + templateCoordinates.column
      : innerCoordinates.column;
  const endColumn =
    innerCoordinates.line === 1
      ? innerCoordinates.endColumn + templateCoordinates.column
      : innerCoordinates.endColumn;

  return {
    line,
    endLine,
    column,
    endColumn,
  };
}
