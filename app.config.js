const { expo: expoFromAppJson } = require("./app.json");

const SENTRY_AUTH_TOKEN = process.env.EXPO_PUBLIC_SENTRY_AUTH_TOKEN;
const SENTRY_ORGANIZATION = process.env.EXPO_PUBLIC_SENTRY_ORGANIZATION;
const SENTRY_PROJECT = process.env.EXPO_PUBLIC_SENTRY_PROJECT;

const sentryExpoPlugin = [
  "@sentry/react-native/expo",
  {
    url: "https://sentry.io/",
    project: SENTRY_PROJECT,
    organization: SENTRY_ORGANIZATION,
    authToken: SENTRY_AUTH_TOKEN,
  },
];

const withSentryAuthTokenPlugin = (expoConfig) => {
  const plugins = Array.isArray(expoConfig.plugins) ? expoConfig.plugins : [];

  // Avoid duplicate entries if the plugin still exists in `app.json`.
  const pluginsWithoutSentry = plugins.filter(
    (plugin) =>
      !(Array.isArray(plugin) && plugin[0] === "@sentry/react-native/expo"),
  );

  return [...pluginsWithoutSentry, sentryExpoPlugin];
};

module.exports = ({ config }) => {
  return {
    ...config,
    expo: {
      ...expoFromAppJson,
      plugins: withSentryAuthTokenPlugin(expoFromAppJson),
      ios: {
        ...expoFromAppJson.ios,
        bundleIdentifier: process.env.EXPO_APP_PACKAGE_NAME,
        googleServicesFile: process.env.EXPO_PUBLIC_GOOGLE_SERVICES_FILE,
        // Xcode archive needs DEVELOPMENT_TEAM; optional CI override via IOS_TEAM_ID secret
        appleTeamId:
          process.env.IOS_TEAM_ID?.trim() ||
          expoFromAppJson.ios?.appleTeamId,
      },
      extra: {
        ...(expoFromAppJson.extra ?? {}),
      },
    },
  };
};
