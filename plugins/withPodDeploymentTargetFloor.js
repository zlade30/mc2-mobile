const { withPodfile } = require('@expo/config-plugins');

const MARKER = '[withPodDeploymentTargetFloor]';

/**
 * Bumps every Pod target's IPHONEOS_DEPLOYMENT_TARGET to at least the app's minimum.
 * Required after `expo prebuild --clean`: the default Podfile only runs react_native_post_install,
 * so Firebase/Google pods stay on 9.0/10.0 and Xcode 26+ warns or fails the archive.
 */
function withPodDeploymentTargetFloor(config) {
  return withPodfile(config, (config) => {
    const podfile = config.modResults;
    if (!podfile?.contents) return config;
    if (podfile.contents.includes(MARKER)) return config;

    const anchor =
      /(:ccache_enabled => ccache_enabled\?\(podfile_properties\),\s*\n\s*\))\s*\n(\s+end)/;
    if (!anchor.test(podfile.contents)) return config;

    const injection = `
    # ${MARKER} raise pods below app IPHONEOS_DEPLOYMENT_TARGET (Xcode 26+)
    __min_ios = podfile_properties['ios.deploymentTarget'] || '16.0'
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        t = bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        next if t.nil?
        begin
          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = __min_ios if Gem::Version.new(t) < Gem::Version.new(__min_ios)
        rescue ArgumentError
          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = __min_ios
        end
      end
    end`;

    podfile.contents = podfile.contents.replace(anchor, `$1${injection}\n$2`);
    config.modResults = podfile;
    return config;
  });
}

module.exports = withPodDeploymentTargetFloor;
