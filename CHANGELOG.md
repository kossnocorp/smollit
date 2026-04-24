# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].

This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## v0.2.0 - 2026-04-24

### Added

- Added `txts` function that filters out non-string and falsy values, trims, normalizes, and joins strings as paragraphs.

- Exposed internal utils: `renderTemplateLiteral`, `splitLines`, and `newlineRegExp`.

- Exported isolated modules `"smollit/lit"`, `"smollit/txt"`, etc. in addition to the main barrel `"smollit"` module.

## v0.1.0 - 2026-04-16

Initial version
