import { strip, text, metaMap, first, decode } from './html.js';
import { stopwordSet } from './stopwords.js';

export { STOPWORDS, stopwordSet } from './stopwords.js';

/** Visible text of an HTML document (scripts, styles, comments and tags removed). */
export function visibleText(html) {
  const body = /<body\b[\s\S]*<\/body>/i.exec(html)?.[0] ?? html;
  return decode(strip(body).replace(/<(br|p|div|li|h[1-6]|tr|td|th|section|article|header|footer|nav)\b[^>]*>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** Split text into lowercase word tokens (Unicode letters and digits, inner hyphens and apostrophes kept). */
export const tokenize = (s) => (String(s).toLowerCase().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []);

/**
 * Count words and phrases.
 * @param {string} input plain text
 * @param {{ngrams?: number[], top?: number, minCount?: number, stopwords?: Set<string>|string[]|false, languages?: string[]}} [options]
 */
export function keywordDensity(input, options = {}) {
  const words = tokenize(input);
  const stop = options.stopwords === false ? new Set() : options.stopwords ? new Set(options.stopwords) : stopwordSet(options.languages);
  const sizes = options.ngrams || [1, 2, 3];
  const top = options.top ?? 20;
  const minCount = options.minCount ?? 2;
  const result = { totalWords: words.length, uniqueWords: new Set(words).size, ngrams: {} };
  for (const n of sizes) {
    const counts = new Map();
    for (let i = 0; i + n <= words.length; i++) {
      const gram = words.slice(i, i + n);
      if (stop.has(gram[0]) || stop.has(gram[n - 1]) || gram.every((w) => /^\d+$/.test(w)) || (n === 1 && gram[0].length < 2)) continue;
      const key = gram.join(' ');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    result.ngrams[n] = [...counts].filter(([, c]) => c >= minCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, top)
      .map(([phrase, count]) => ({ phrase, count, density: words.length ? +((count * n * 100) / words.length).toFixed(2) : 0 }));
  }
  return result;
}

const countPhrase = (words, phrase) => {
  const p = tokenize(phrase);
  let n = 0;
  for (let i = 0; i + p.length <= words.length; i++) if (p.every((w, j) => words[i + j] === w)) n++;
  return n;
};

/** Where a target keyword appears on a page and how dense it is. */
export function keywordReport(keyword, { body, title = '', description = '', h1 = '' }) {
  const words = tokenize(body);
  const size = tokenize(keyword).length || 1;
  const count = countPhrase(words, keyword);
  const density = words.length ? +((count * size * 100) / words.length).toFixed(2) : 0;
  const has = (s) => countPhrase(tokenize(s), keyword) > 0;
  const placement = { title: has(title), description: has(description), h1: has(h1), first100: countPhrase(words.slice(0, 100), keyword) > 0 };
  const issues = [];
  const add = (level, code, message) => issues.push({ level, code, message });
  if (!count) add('warning', 'keyword-absent', `"${keyword}" does not appear in the text.`);
  else if (density > 3) add('warning', 'keyword-stuffing', `"${keyword}" makes up ${density}% of the text; above ~3% reads as keyword stuffing.`);
  for (const [where, ok] of Object.entries({ title: placement.title, h1: placement.h1, description: placement.description })) if (!ok && (title || h1 || description)) add('info', `not-in-${where}`, `"${keyword}" is not in the ${where === 'h1' ? 'H1' : where}.`);
  if (count && !placement.first100) add('info', 'not-early', `"${keyword}" does not appear in the first 100 words.`);
  return { keyword, count, density, placement, issues };
}

/**
 * Fetch a page and analyse the frequency of words and phrases in its visible text.
 * @param {string} url
 * @param {{fetch?: typeof fetch, keyword?: string} & Parameters<typeof keywordDensity>[1]} [options]
 */
export async function analyzeUrl(url, options = {}) {
  const doFetch = options.fetch || globalThis.fetch;
  const start = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).toString();
  const res = await doFetch(start, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; keyword-density; +https://github.com/ksanyok/keyword-density)' } });
  return analyzeHtml(await res.text(), { ...options, url: res.url || start, status: res.status });
}

/** Analyse an HTML string. */
export function analyzeHtml(html, options = {}) {
  const clean = strip(html);
  const head = /<head\b[\s\S]*?<\/head>/i.exec(clean)?.[0] || '';
  const page = { title: text(head, 'title') || '', description: first(metaMap(head).description) || '', h1: text(clean, 'h1') || '', body: visibleText(html) };
  const lang = (/<html[^>]*\blang=["']?([a-z]{2})/i.exec(html)?.[1] || '').toLowerCase();
  const density = keywordDensity(page.body, { languages: options.languages || (lang && lang !== 'en' ? ['en', lang] : undefined), ...options });
  return { url: options.url, status: options.status, lang: lang || null, title: page.title, h1: page.h1, ...density, target: options.keyword ? keywordReport(options.keyword, page) : null };
}
