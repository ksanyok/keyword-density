import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, keywordDensity, keywordReport, visibleText, analyzeHtml, analyzeUrl } from '../src/index.js';

const TEXT = 'Blue widgets are great. Our blue widgets last for years, and blue widgets ship free. Red gadgets? Not so much.';

test('tokenizes Unicode text', () => {
  assert.deepEqual(tokenize("Don't stop — e-mail Привіт, świat 2026!"), ["don't", 'stop', 'e-mail', 'привіт', 'świat', '2026']);
});

test('counts words and phrases without stop words', () => {
  const r = keywordDensity(TEXT, { top: 5 });
  assert.equal(r.totalWords, 20);
  assert.deepEqual(r.ngrams[1][0], { phrase: 'blue', count: 3, density: 15 });
  assert.deepEqual(r.ngrams[2][0], { phrase: 'blue widgets', count: 3, density: 30 });
  assert.ok(!r.ngrams[1].some((e) => e.phrase === 'and'));
});

test('options: no stop words, min count, n-gram sizes', () => {
  const r = keywordDensity('the cat and the dog and the bird', { stopwords: false, ngrams: [1], minCount: 3 });
  assert.deepEqual(r.ngrams[1], [{ phrase: 'the', count: 3, density: 37.5 }]);
  assert.deepEqual(Object.keys(keywordDensity('a b', { ngrams: [2] }).ngrams), ['2']);
});

test('keyword report: density, placement and stuffing', () => {
  const ok = keywordReport('blue widgets', { body: TEXT, title: 'Blue Widgets Shop', h1: 'Blue widgets', description: 'Buy blue widgets' });
  assert.equal(ok.count, 3);
  assert.deepEqual(ok.placement, { title: true, description: true, h1: true, first100: true });
  const stuffed = keywordReport('blue widgets', { body: TEXT });
  assert.ok(stuffed.issues.some((i) => i.code === 'keyword-stuffing'));
  assert.ok(keywordReport('purple', { body: TEXT }).issues.some((i) => i.code === 'keyword-absent'));
});

test('extracts visible text from HTML', () => {
  const html = '<html lang="uk"><head><title>T</title><style>.a{}</style></head><body><h1>Заголовок</h1><script>var x="hidden"</script><p>Один&nbsp;два</p><!-- secret --></body></html>';
  const t = visibleText(html);
  assert.ok(t.includes('Заголовок'));
  assert.ok(!t.includes('hidden') && !t.includes('secret'));
  const r = analyzeHtml(html, { keyword: 'заголовок', minCount: 1 });
  assert.equal(r.lang, 'uk');
  assert.equal(r.target.placement.h1, true);
});

test('fetches a URL', async () => {
  const r = await analyzeUrl('example.com', { fetch: async () => new Response(`<body><p>${TEXT}</p></body>`) });
  assert.equal(r.url, 'https://example.com/');
  assert.equal(r.ngrams[2][0].phrase, 'blue widgets');
});
