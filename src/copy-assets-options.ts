/**
 * Options for the copy assets plugin.
 */
export interface CopyAssetsOptions {
  /**
   * Copy only image assets (e.g. `![label](./path/image.png)`).
   *
   * @default true
   */
  onlyImages: boolean;
  /**
   * List of regex strings to check to include in the copied assets.
   * Undefined will copy everything.
   */
  include?: string[];
  /**
   * List of regex strings to check to exclude from the copied assets.
   * This removes items allowed by the include list.
   * Undefined will copy everything.
   */
  exclude?: string[];
}

/** Default option values. */
export const defaultOptions: CopyAssetsOptions = {
  onlyImages: true,
  include: undefined,
  exclude: undefined,
};

/** Key of the options in the options file. */
export const optionsKey: string = 'copyAssets';
