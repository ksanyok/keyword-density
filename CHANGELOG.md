# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-26

### Added
- `keyword-density` CLI for URLs, local HTML or text files and stdin, with `--keyword`, `--top`, `--min`, `--lang`, `--no-stopwords`, `--json`
- Visible-text extraction that ignores scripts, styles, comments and markup and decodes entities
- Unicode tokenizer that keeps hyphenated words and apostrophes; built-in stop words for en, uk, ru, pl and de
- 1-, 2- and 3-word phrase counts with density, skipping phrases that start or end with a stop word
- Target keyword report: count, density, stuffing warning above 3%, presence in title, H1, description and first 100 words
- Library API (`analyzeUrl`, `analyzeHtml`, `keywordDensity`, `keywordReport`, `tokenize`, `visibleText`) and GitHub Action

[1.0.0]: https://github.com/ksanyok/keyword-density/releases/tag/v1.0.0
