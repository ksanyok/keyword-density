# FAQ

## What is a good keyword density?

There is no magic number. Natural texts usually land between 0.5% and 2.5% for their main phrase. Above about 3% the text tends to read as repetitive; below 0.3% the topic may be unclear.

## Does Google use keyword density?

Not as a ranking formula. It understands topics and synonyms. Density is a diagnostic: it shows focus and catches stuffing.

## Why are some common words missing?

They are stop words (and, the, для, що…). Use `--no-stopwords` to keep them or `--lang` to choose the lists.

## Are navigation and footer counted?

Yes, everything in the visible body text counts, as it does for crawlers. To analyse only the article, save it as text and use `--file`.

## Which languages are supported?

Any language that separates words with spaces. Stop-word lists are built in for English, Ukrainian, Russian, Polish and German, and you can pass your own.
