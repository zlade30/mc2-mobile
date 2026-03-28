const { withPodfile } = require('@expo/config-plugins');

/**
 * Adds `use_modular_headers!` to the Podfile so it survives `expo prebuild --clean`.
 * expo-build-properties only supports per-pod modular_headers via extraPods, not this global directive.
 */
function withModularHeaders(config) {
  return withPodfile(config, (config) => {
    const podfile = config.modResults;
    if (!podfile?.contents) return config;

    if (podfile.contents.includes('use_modular_headers!')) {
      return config;
    }

    // Insert after "use_expo_modules!" so it applies to the target block
    podfile.contents = podfile.contents.replace(
      /(use_expo_modules!\n)/,
      '$1\n  use_modular_headers!\n'
    );
    config.modResults = podfile;
    return config;
  });
}

module.exports = withModularHeaders;
