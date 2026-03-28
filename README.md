# Sentry Crash Reporting

This app is configured to auto-capture JavaScript and native crashes with `@sentry/react-native`.

## Required environment variables

- `EXPO_PUBLIC_SENTRY_DSN`: Required at runtime so `Sentry.init(...)` can start crash capture.
- `EXPO_PUBLIC_SENTRY_ENVIRONMENT` (optional): Overrides default environment (`development` in dev, `production` otherwise).
- `EXPO_PUBLIC_SENTRY_RELEASE` (optional): Overrides release tag used for grouping.
- `SENTRY_AUTH_TOKEN`: Required during build time to upload debug symbols/source maps.
- `SENTRY_ORG` and `SENTRY_PROJECT`: Required during build time for upload scripts.

## Notes

- Native crash events are typically sent on next app launch after a hard crash.
- Local dev may disable upload using `SENTRY_DISABLE_AUTO_UPLOAD=true`; this can reduce symbolication quality but does not disable event ingestion.
- Ensure release/CI builds do not set `SENTRY_DISABLE_AUTO_UPLOAD=true`.

## Quick verification checklist

1. Start the app with a valid `EXPO_PUBLIC_SENTRY_DSN`.
2. Trigger one JS error and verify it appears in Sentry.
3. Trigger one native crash on each platform, relaunch the app, then verify events in Sentry.
4. Confirm stack traces are symbolicated in release-like builds.
