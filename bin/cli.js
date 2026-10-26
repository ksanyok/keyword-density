#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { analyzeUrl, analyzeHtml, keywordDensity, keywordReport } from '../src/index.js';

const HELP = `Usage: keyword-density <url> [options]
       keyword-density --file article.md|page.html [options]
       cat draft.txt | keyword-density --stdin

Counts the most frequent words and 2- and 3-word phrases in a page or text,
with density in percent, and checks a target keyword's density and placement.

Options:
  -k, --keyword <phrase>  Target keyword to check (density, title, H1, first 100 words)
  --top <n>               Phrases per list (default: 15)
  --min <n>               Minimum occurrences (default: 2)
  --lang <codes>          Stop-word languages, e.g. en,uk (default: all built-in)
  --no-stopwords          Keep stop words
  --file <path>           Analyse a local file (.html is parsed, anything else is plain text)
  --stdin                 Read plain text from standard input
  --json                  Print JSON
  -h, --help              Show this help

Online version (no install): https://promopilot.link/en/tools/keyword-density.php
`;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (...names) => { for (const n of names) { const i = args.indexOf(n); if (i >= 0) return args[i + 1]; } return undefined; };
if (!args.length || flag('-h') || flag('--help')) { process.stdout.write(HELP); process.exit(args.length ? 0 : 2); }

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const ICON = { error: c(31, '✖'), warning: c(33, '!'), info: c(36, 'i') };
const valued = new Set(['-k', '--keyword', '--top', '--min', '--lang', '--file']);
const opts = {
  keyword: value('-k', '--keyword'), top: Number(value('--top') || 15), minCount: Number(value('--min') || 2),
  languages: value('--lang')?.split(','), stopwords: flag('--no-stopwords') ? false : undefined,
};

try {
  let r;
  const file = value('--file');
  if (flag('--stdin') || (file && !/\.html?$/i.test(file))) {
    const body = readFileSync(file || 0, 'utf8');
    r = { ...keywordDensity(body, opts), target: opts.keyword ? keywordReport(opts.keyword, { body }) : null };
  } else if (file) {
    r = analyzeHtml(readFileSync(file, 'utf8'), opts);
  } else {
    r = await analyzeUrl(args.find((a, i) => !a.startsWith('-') && !valued.has(args[i - 1])), opts);
  }
  if (flag('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  if (r.url) console.log(`${c(1, 'URL:')}   ${r.url}`);
  console.log(`${c(1, 'Words:')} ${r.totalWords} (${r.uniqueWords} unique)\n`);
  const lists = Object.entries(r.ngrams).map(([n, list]) => ({ head: n === '1' ? 'Words' : `${n}-word phrases`, list }));
  const width = 34;
  const rows = Math.max(...lists.map((l) => l.list.length));
  console.log(lists.map((l) => c(1, l.head.padEnd(width))).join('').trimEnd());
  for (let i = 0; i < rows; i++) {
    console.log(lists.map((l) => {
      const e = l.list[i];
      if (!e) return ''.padEnd(width);
      const label = e.phrase.length > 20 ? `${e.phrase.slice(0, 19)}…` : e.phrase;
      return `${label.padEnd(21)}${String(e.count).padStart(4)} ${`${e.density}%`.padStart(6)}  `;
    }).join('').trimEnd());
  }
  if (r.target) {
    const t = r.target;
    const yes = (b) => (b ? c(32, 'yes') : c(31, 'no'));
    console.log(`\n${c(1, 'Keyword:')} "${t.keyword}" — ${t.count}×, ${t.density}%`);
    console.log(`  title ${yes(t.placement.title)} · H1 ${yes(t.placement.h1)} · description ${yes(t.placement.description)} · first 100 words ${yes(t.placement.first100)}`);
    for (const i of t.issues) console.log(`  ${ICON[i.level]} ${i.message}`);
  }
  process.exit(r.target?.issues.some((i) => i.level !== 'info') ? 1 : 0);
} catch (err) {
  console.error(c(31, `Error: ${err.message}`));
  process.exit(2);
}
