const { withPodfile } = require("@expo/config-plugins");

/**
 * Raises IPHONEOS_DEPLOYMENT_TARGET for pods below the app's minimum.
 * Survives `expo prebuild --clean`. Needed on Xcode 26+ where very old pod
 * targets (9.0, 10.0) trigger toolchain warnings and can fail archives.
 */
function withPodDeploymentTargetFloor(config) {
  return withPodfile(config, (cfg) => {
    const podfile = cfg.modResults;
    if (!podfile?.contents) return cfg;

    if (podfile.contents.includes("[withPodDeploymentTargetFloor]")) {
      return cfg;
    }

    const snippet = `
    # [withPodDeploymentTargetFloor] raise pods below app IPHONEOS_DEPLOYMENT_TARGET (Xcode 26+)
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

    const replaced = podfile.contents.replace(
      /(react_native_post_install\([\s\S]*?\n\s+\))(\s*\n\s*end\s*\n\s*end\s*)/m,
      `$1${snippet}\n$2`,
    );

    if (replaced === podfile.contents) {
      throw new Error(
        "[withPodDeploymentTargetFloor] Could not patch Podfile: react_native_post_install block not found or layout changed.",
      );
    }

    podfile.contents = replaced;
    cfg.modResults = podfile;
    return cfg;
  });
}

module.exports = withPodDeploymentTargetFloor;
