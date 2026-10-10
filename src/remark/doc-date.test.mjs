import assert from 'node:assert/strict';
import test from 'node:test';
import remarkDocDate, { getDocDate } from './doc-date.mjs';

for (const date of ['2026-10-10', '2024-02-29', '2000-02-29']) {
  test(`accepts valid filename date ${date}`, () => {
    assert.equal(getDocDate(`/docs/자료 공유/${date}-example.md`), date);
    assert.equal(getDocDate(`/docs/${date}-example.mdx`), date);
  });
}

for (const filename of [
  'example.md',
  '2026-02-29-example.md',
  '1900-02-29-example.md',
  '2026-04-31-example.md',
  '2026-13-01-example.md',
  '2026-00-10-example.md',
  '2026-01-00-example.md',
  '2026-1-01-example.md',
  'prefix-2026-01-01-example.md',
]) {
  test(`omits missing or invalid date: ${filename}`, () => {
    assert.equal(getDocDate(`/docs/2026-01-01/${filename}`), null);
  });
}

test('places one date below the Markdown title, keeping the title and body unchanged', () => {
  const heading = { type: 'heading', depth: 1, children: [{ type: 'text', value: '제목' }] };
  const header = { type: 'mdxJsxFlowElement', name: 'header', children: [heading] };
  const body = { type: 'paragraph', children: [{ type: 'text', value: '본문' }] };
  const tree = { type: 'root', children: [header, body] };
  remarkDocDate()(tree, { path: '/docs/2026-06-12-example.md' });
  assert.deepEqual(tree.children, [header, body]);
  assert.equal(header.children[0], heading);
  const dateNode = header.children[1];
  assert.equal(dateNode.children[0].value, '작성일: ');
  assert.deepEqual(dateNode.children[1].attributes, [
    { type: 'mdxJsxAttribute', name: 'dateTime', value: '2026-06-12' },
  ]);
  assert.equal(dateNode.children[1].children[0].value, '2026년 6월 12일');
});

test('prepends to content when the theme supplies a front-matter or automatic title', () => {
  const body = { type: 'paragraph', children: [{ type: 'text', value: '본문' }] };
  const tree = { type: 'root', children: [body] };
  remarkDocDate()(tree, { path: '/docs/2026-10-10-example.md' });
  assert.equal(tree.children.length, 2);
  assert.equal(tree.children[0].name, 'div');
  assert.equal(tree.children[1], body);
});

test('leaves undated and invalid-date documents untouched', () => {
  for (const path of ['/docs/intro.md', '/docs/2026-02-30-example.md', undefined]) {
    const tree = { type: 'root', children: [{ type: 'paragraph', children: [] }] };
    const original = structuredClone(tree);
    remarkDocDate()(tree, { path });
    assert.deepEqual(tree, original);
  }
});
