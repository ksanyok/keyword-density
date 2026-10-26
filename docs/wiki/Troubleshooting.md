# Troubleshooting

## Very few words found

The page renders its content with JavaScript. Save the rendered HTML from the browser and use `--file`.

## Strange words like 'retrieved' or 'archived' at the top

Repeated boilerplate (references, menus, footers) counts too. Analyse the article text alone with `--file` or raise `--min`.

## Exit code 1

With `--keyword`, the tool exits with 1 when the keyword is missing or above the stuffing threshold, so CI can flag it.

## Still stuck?

Open an [issue](https://github.com/ksanyok/keyword-density/issues/new/choose) with the command, the output (`--json` if possible) and your Node.js version — or compare with the [online version](https://promopilot.link/en/tools/keyword-density.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=keyword-density).
