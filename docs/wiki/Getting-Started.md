# Getting started

## Requirements

Node.js 18 or newer. No other dependencies.

## Install

```bash
# one-off run
npx github:ksanyok/keyword-density example.com

# global CLI
npm install -g github:ksanyok/keyword-density

# as a library in your project
npm install github:ksanyok/keyword-density
```

## First run

```bash
keyword-density example.com
```

The header shows the URL and the number of words. Three columns list the top words, 2-word and 3-word phrases with their count and density. With `--keyword` you get its count, density and placement (title, H1, description, first 100 words) and any warnings.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No errors (warnings allowed unless `--strict`) |
| 1 | Errors found (or warnings with `--strict`) |
| 2 | Bad arguments or the check could not run |

## More examples

**Check a draft before publishing**

```bash
keyword-density --file drafts/blue-widgets.md --keyword "blue widgets"
```

**Only Ukrainian and English stop words, top 30**

```bash
keyword-density https://example.com/uk/blog/post --lang uk,en --top 30
```

**Compare with a competitor**

```bash
keyword-density https://competitor.example/guide --json | jq '.ngrams["2"][:10]'
```

## Without installing anything

Use the [online Keyword Density Checker](https://promopilot.link/en/tools/keyword-density.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=keyword-density).
