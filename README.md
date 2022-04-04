# Copy assets plugin for typedoc

This plugin for typedoc copies the image assets found in comments to the output assets folder.

This way if you define an image in the jsdoc comment it will be copied into the output folder and the path modified to be used from there.

The image path must be relative (starting with ```./``` or ```../```) to the current file processed to be copied to the output.

Same named files (from different paths) will be suffixed with an index.

## The output path

The output will be determined from the settings of typedoc using the ```out``` option (see [typedoc options](https://typedoc.org/guides/options/#out)) joined with ```assets/media```.
