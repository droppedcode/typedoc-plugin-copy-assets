import { Application } from 'typedoc';

import { CopyAssets } from './copy-assets';

/**
 * Load the plugin.
 *
 * @param pluginHost Plugin host to load to.
 */
export function load(pluginHost: Application): void {
  const app = pluginHost.owner;

  new CopyAssets().initialize(app);
}
