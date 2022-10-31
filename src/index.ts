import { Application, ParameterType } from 'typedoc';

import { CopyAssets } from './copy-assets';
import { defaultOptions, optionsKey } from './copy-assets-options';

/**
 * Load the plugin.
 *
 * @param pluginHost Plugin host to load to.
 */
export function load(pluginHost: Application): void {
  const app = pluginHost.owner;

  pluginHost.options.addDeclaration({
    name: optionsKey,
    help: 'Copy assets plugin options.',
    type: ParameterType.Object,
    defaultValue: defaultOptions,
  });

  new CopyAssets().initialize(app);
}
