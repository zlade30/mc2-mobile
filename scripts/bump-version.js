const fs = require("fs");
const path = require("path");

const appJsonPath = path.join(process.cwd(), "app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

// Bump patch version: 1.0.0 -> 1.0.1
const [major, minor, patch] = appJson.expo.version.split(".").map(Number);
appJson.expo.version = `${major}.${minor}.${patch + 1}`;

// Increment versionCode
appJson.expo.android.versionCode = (appJson.expo.android.versionCode ?? 1) + 1;

// Increment iOS buildNumber
appJson.expo.ios.buildNumber = String(
  parseInt(appJson.expo.ios.buildNumber ?? "1") + 1,
);

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(
  `Version bumped to ${appJson.expo.version} (versionCode: ${appJson.expo.android.versionCode}, buildNumber: ${appJson.expo.ios.buildNumber})`,
);
