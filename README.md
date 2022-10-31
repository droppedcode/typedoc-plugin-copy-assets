# Copy assets plugin for typedoc

This plugin for typedoc copies the assets found in comments to the output assets folder.

This way if you define any assets in the jsdoc comment it will be copied into the output folder and the path modified to be used from there.

The path must be relative (starting with `./` or `../`) to the current file processed to be copied to the output.

Same named files (from different paths) will be suffixed with an index.

## Configuration

To configure what assets are copied you can configure it in the typedoc options file. By default only images (e.g. `![label](./path/image.png)`) are copied to allow non image links (e.g. `[label](./path/image.md)`), set the only images to false.

To define more granular control over what is copied add regexes to the include list and/or exclude list.

E.g. configuration that allows png images and md files, but not from the exclude folder:

```json
{
  "copyAssets": {
    "onlyImages": false,
    "include": [".(png|md)\\)$"],
    "exclude": ["\\(.*?exclude/.*?\\)$"]
  }
}
```

When processing what to copy the plugin first checks that any include item are a match for the current link and after the exclude list is checked to remove not wanted items.

## The output path

The output will be determined from the settings of typedoc using the `out` option (see [typedoc options](https://typedoc.org/guides/options/#out)) joined with `assets/media`.
