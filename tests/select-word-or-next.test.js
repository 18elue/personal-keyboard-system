const test = require('node:test');
const assert = require('node:assert/strict');
const select = require('../configs/obsidian/select-word-or-next.js');
const selectLine = require('../configs/obsidian/select-line.js');

class Editor {
  constructor(text, selections, focused = true) {
    this.text = text;
    this.focused = focused;
    this.setOffsets(selections);
  }
  posToOffset({ line, ch }) {
    return this.text.split('\n').slice(0, line).reduce((n, text) => n + text.length + 1, 0) + ch;
  }
  offsetToPos(offset) {
    const before = this.text.slice(0, offset).split('\n');
    return { line: before.length - 1, ch: before.at(-1).length };
  }
  setOffsets(ranges) {
    this.selections = ranges.map(([anchor, head = anchor]) => ({
      anchor: this.offsetToPos(anchor), head: this.offsetToPos(head)
    }));
  }
  offsets() {
    return this.selections.map(({ anchor, head }) => [this.posToOffset(anchor), this.posToOffset(head)]);
  }
  getValue() { return this.text; }
  getLine(line) { return this.text.split('\n')[line]; }
  lineCount() { return this.text.split('\n').length; }
  hasFocus() { return this.focused; }
  listSelections() { return structuredClone(this.selections); }
  setSelections(selections, main) { this.selections = selections; this.main = main; }
  getRange(from, to) { return this.text.slice(this.posToOffset(from), this.posToOffset(to)); }
  scrollIntoView(range) { this.scrolled = range; }
  wordAt(position) {
    const index = this.posToOffset(position);
    for (const match of this.text.matchAll(/[\p{L}\p{N}_]+/gu)) {
      if (match.index <= index && index < match.index + match[0].length) {
        return { from: this.offsetToPos(match.index), to: this.offsetToPos(match.index + match[0].length) };
      }
    }
    return null;
  }
}
function run(editor) {
  const before = editor.text;
  const result = select({ app: { workspace: { activeEditor: { editor } } } });
  assert.equal(editor.text, before, 'selection must never modify text');
  return result;
}

test('selects a word at its start or interior without changing text', () => {
  for (const offset of [0, 2]) {
    const editor = new Editor('client_id = abc-dft-qwe', [[offset]]);
    assert.equal(run(editor), true);
    assert.deepEqual(editor.offsets(), [[0, 9]]);
  }
});
test('uses the editor word boundary API for a hyphenated value', () => {
  const editor = new Editor('abc-dft-qwe', [[0]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[0, 3]]);
});
test('adds following matches and stops after every match is selected', () => {
  const editor = new Editor('foo foo foo', [[0]]);
  for (let i = 0; i < 3; i++) assert.equal(run(editor), true);
  assert.deepEqual(editor.offsets(), [[0, 3], [4, 7], [8, 11]]);
  assert.equal(run(editor), false);
  assert.equal(editor.main, 2);
});
test('wraps to unselected matches before the original selection', () => {
  const editor = new Editor('foo foo foo', [[8, 11]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[8, 11], [0, 3]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[8, 11], [0, 3], [4, 7]]);
});
test('skips overlapping occurrences instead of corrupting a multi-selection', () => {
  const editor = new Editor('aaaa aa', [[0, 2]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[0, 2], [2, 4]]);
});
test('preserves reversed selections and adds a forward match', () => {
  const editor = new Editor('foo foo', [[3, 0]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[3, 0], [4, 7]]);
});
test('supports explicitly selected literal punctuation and line breaks', () => {
  const editor = new Editor('a-\nb a-\nb', [[0, 4]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[0, 4], [5, 9]]);
});
test('expands multiple carets before adding occurrences', () => {
  const editor = new Editor('abc def', [[1], [5]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[0, 3], [4, 7]]);
  assert.equal(run(editor), false, 'different selected texts must not be guessed');
});
test('keeps existing selections while expanding empty carets', () => {
  const editor = new Editor('abc def', [[0, 3], [5]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[0, 3], [4, 7]]);
});
test('leaves whitespace and non-editor focus alone', () => {
  const space = new Editor('a  b', [[2]]);
  assert.equal(run(space), false);
  assert.deepEqual(space.offsets(), [[2, 2]]);
  const blurred = new Editor('foo', [[1]], false);
  assert.equal(run(blurred), false);
  assert.deepEqual(blurred.offsets(), [[1, 1]]);
  assert.equal(select(), false);
  assert.equal(select({ app: { workspace: {} } }), false);
});
test('handles Unicode words using positions supplied by the editor', () => {
  const editor = new Editor('你好 你好', [[0]]);
  run(editor);
  run(editor);
  assert.deepEqual(editor.offsets(), [[0, 2], [3, 5]]);
});
test('normalizes out-of-order existing selections before choosing a new match', () => {
  const editor = new Editor('foo foo foo', [[8, 11], [0, 3]]);
  run(editor);
  assert.deepEqual(editor.offsets(), [[8, 11], [0, 3], [4, 7]]);
});

function runLine(editor) {
  const before = editor.text;
  const result = selectLine({ app: { workspace: { activeEditor: { editor } } } });
  assert.equal(editor.text, before);
  return result;
}
test('selects a logical line including its newline and extends on repetition', () => {
  const editor = new Editor('abc\ndef\nghi', [[1]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[0, 4]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[0, 8]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[0, 11]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[0, 11]]);
});
test('does not invent a newline after the last line', () => {
  const editor = new Editor('abc\ndef', [[6]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[4, 7]]);
});
test('expands reversed and multiline selections without adding an untouched line', () => {
  const editor = new Editor('abc\ndef\nghi', [[8, 1]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[8, 0]]);
});
test('selects empty lines and supports multiple carets', () => {
  const editor = new Editor('abc\n\ndef', [[1], [4]]);
  runLine(editor);
  assert.deepEqual(editor.offsets(), [[0, 4], [4, 5]]);
});
test('line selection does nothing outside a focused editor', () => {
  assert.equal(selectLine(), false);
  const editor = new Editor('abc', [[1]], false);
  assert.equal(runLine(editor), false);
  assert.deepEqual(editor.offsets(), [[1, 1]]);
});
