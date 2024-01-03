# Copy assets plugin for typedoc

This plugin for typedoc copies the assets found in comments to the output assets folder.

This way if you define any assets in the jsdoc comment it will be copied into the output folder and the path modified to be used from there.

The path must be relative (starting with `./` or `../`) to the current file processed to be copied to the output.

Same named files (from different paths) will be suffixed with an index.

## Configuration

To configure what assets are copied you can configure it in the typedoc options file. By default only images (e.g. `![label](./path/image.png)`) are copied to allow non image links (e.g. `[label](./path/image.md)`), set the only images to false.

To define more granular control over what is copied add regexes to the `include`/`includePath` lists and/or `exclude`/`excludePath` lists.

You can enable the copy from html image tags (e.g. `<img src="path/to/image.png" alt="Image" />`) with the `copyHtmlImgTag` option. It handles all paths as relative (e.g. `path/img.png` is same as `./path/img.png`).

E.g. configuration that allows png images and md files, but not from the exclude folder:

```json
{
  "copyAssets": {
    "onlyImages": false,
    "include": [],
    "exclude": [],
    "includePath": [".(png|md)$"],
    "excludePath": [".*?exclude/.*?$"],
    "copyHtmlImgTag": false
  }
}
```

### Options

- `onlyImages` changes that markdown links `[foo](bar)` or only images `![foo](bar)` are matched.
- `copyHtmlImgTag` option adds html img link matches.

### How include / exclude works

There are 2 pairs, the `include`/`exclude` will match against the whole link (e.g. `[foo](bar.baz)`), the `includePath`/`excludePath` will be matched against the path part only (e.g. `bar.baz`).
The workflow:

- Filters based on `include` list, removing non matching links.
- Filters based on `exclude` list, removing matching links.
- Filters based on `includePath` list, removing non matching paths.
- Filters based on `excludePath` list, removing matching paths.

## The output path

The output will be determined from the settings of typedoc using the `out` option (see [typedoc options](https://typedoc.org/guides/options/#out)) joined with `assets/media`.

## Typedoc

Supports 0.25 (tested with 0.25.2)

For 0.23 see version 1.0.9

For 0.22 see version 1.0.4

## How to build

- download the source or clone it
- npm i
- npm run build

## How to debug

- `npm run test:prep`
- Update the `@droppedcode/typedoc-plugin-copy-assets` version in `tests\typedoc-plugins-example\package.json` if needed
- vscode F5 or debug or run `npx typedoc` in the `tests\typedoc-plugins-example` folder

## Changes

### 1.0.11

- Added support for html img tags `copyHtmlImgTag` option, default false.
- Added `includePath` / `excludePath` options.
