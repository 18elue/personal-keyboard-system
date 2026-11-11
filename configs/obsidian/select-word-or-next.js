/* QuickAdd user script. Uses only public Obsidian Editor APIs. */
module.exports = function selectWordOrNext({ app } = {}) {
  const editor = app?.workspace?.activeEditor?.editor;
  // A direct hotkey should act only in the focused editor, never a stale note.
  if (!editor || !editor.hasFocus()) return false;

  const selections = editor.listSelections();
  if (selections.length === 0) return false;
  const offsets = selections.map(({ anchor, head }) => {
    const a = editor.posToOffset(anchor);
    const h = editor.posToOffset(head);
    return { from: Math.min(a, h), to: Math.max(a, h) };
  });

  if (offsets.some(({ from, to }) => from === to)) {
    let changed = false;
    const expanded = selections.map((selection, index) => {
      if (offsets[index].from !== offsets[index].to) return selection;
      const word = editor.wordAt(selection.head);
      if (!word) return selection;
      changed = true;
      return { anchor: word.from, head: word.to };
    });
    if (!changed) return false;
    editor.setSelections(expanded);
    return true;
  }

  const needle = editor.getRange(
    editor.offsetToPos(offsets[0].from),
    editor.offsetToPos(offsets[0].to)
  );
  if (!needle || offsets.some(({ from, to }) =>
    editor.getRange(editor.offsetToPos(from), editor.offsetToPos(to)) !== needle
  )) return false;

  const text = editor.getValue();
  const start = Math.max(...offsets.map(({ to }) => to));
  const overlaps = (from) => offsets.some((range) =>
    from < range.to && from + needle.length > range.from
  );
  const find = (from, until) => {
    let index = text.indexOf(needle, from);
    while (index !== -1 && index < until) {
      if (!overlaps(index)) return index;
      index = text.indexOf(needle, index + 1);
    }
    return -1;
  };
  let next = find(start, text.length);
  if (next === -1) next = find(0, start);
  if (next === -1) return false;

  const range = {
    from: editor.offsetToPos(next),
    to: editor.offsetToPos(next + needle.length)
  };
  editor.setSelections(
    [...selections, { anchor: range.from, head: range.to }],
    selections.length
  );
  editor.scrollIntoView(range);
  return true;
};
