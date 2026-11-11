/* QuickAdd user script: select logical lines, including their line breaks. */
module.exports = function selectLine({ app } = {}) {
  const editor = app?.workspace?.activeEditor?.editor;
  if (!editor || !editor.hasFocus()) return false;
  const selections = editor.listSelections();
  if (selections.length === 0) return false;
  const lastLine = editor.lineCount() - 1;
  const expanded = selections.map(({ anchor, head }) => {
    const reversed = editor.posToOffset(anchor) > editor.posToOffset(head);
    const from = reversed ? head : anchor;
    const to = reversed ? anchor : head;
    const endsAtLineStart = to.ch === 0 && to.line > from.line;
    // A repeated invocation on whole lines includes the following line.
    const endLine = endsAtLineStart && from.ch !== 0 ? to.line - 1 : to.line;
    const start = { line: from.line, ch: 0 };
    const end = endLine < lastLine
      ? { line: endLine + 1, ch: 0 }
      : { line: lastLine, ch: editor.getLine(lastLine).length };
    return reversed ? { anchor: end, head: start } : { anchor: start, head: end };
  });
  editor.setSelections(expanded);
  return true;
};
