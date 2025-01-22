import { describe, it, expect } from 'vitest';
import { extractTemplates, reverseInnerCoordinates } from "content-tag-utils";

describe('reverseInnerCoordinates', () => {
  it('transforms the coordinates', () => {
    let js = '<template>{{book}}</template>';

    // Return value of buildRules + transform
    const lintResult = {
      column: 2,
      endColumn: 6,
      endLine: 1,
      line: 1,
      // not needed: rule, message, filePath, severity, source
    };
    const templateInfos = extractTemplates(js);
    const result = reverseInnerCoordinates(templateInfos[0], lintResult);

    expect(result.line).toBe(1);
    expect(result.endLine).toBe(1);
    expect(result.column).toBe(12);
  });
});
