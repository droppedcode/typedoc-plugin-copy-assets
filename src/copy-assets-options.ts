/**
 * Options for the copy assets plugin.
 */
export interface CopyAssetsOptions {
  /**
   * Copy only image assets (e.g. `![label](./path/image.png)`).
   * @default true
   */
  onlyImages: boolean;
  /**
   * List of regex strings to check to include in the copied assets based on the full match.
   * Undefined will copy everything.
   */
  include?: string[];
  /**
   * List of regex strings to check to exclude from the copied assets based on the full match.
   * This removes items allowed by the include list.
   * Undefined will copy everything.
   */
  exclude?: string[];
  /**
   * List of regex strings to check to include in the copied assets based on the path match.
   * Undefined will copy everything.
   */
  includePath?: string[];
  /**
   * List of regex strings to check to exclude from the copied assets based on the path match.
   * This removes items allowed by the include list.
   * Undefined will copy everything.
   */
  excludePath?: string[];
  /**
   * Copy image html tag sources (e.g. `<img src="path/to/image.png" alt="Image" />`).
   * @default false
   */
  copyHtmlImgTag?: boolean;
}

/** Default option values. */
export const defaultOptions: CopyAssetsOptions = {
  onlyImages: true,
  include: undefined,
  exclude: undefined,
  includePath: undefined,
  excludePath: undefined,
  copyHtmlImgTag: false,
};

/** Key of the options in the options file. */
export const optionsKey: string = 'copyAssets';
