import { Colors } from "@/shared/theme";

export function wrapHtmlFragment(
  html: string,
  colorScheme: "light" | "dark",
): string {
  const trimmed = html.trim();
  if (
    trimmed.toLowerCase().startsWith("<!doctype") ||
    trimmed.toLowerCase().startsWith("<html")
  ) {
    return html;
  }
  const theme = Colors[colorScheme] ?? Colors.light;
  const bg = theme.background;
  const text = theme.text;
  const link = theme.link;
  const fontFamily =
    "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="color-scheme" content="${colorScheme}" />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: ${fontFamily}; font-size: 16px; line-height: 1.5; color: ${text}; background-color: ${bg}; padding-bottom: 16px; padding-left: 16px; padding-right: 16px; margin: 0; }
    body > *:first-child { margin-top: 0 !important; }
    body > *:last-child { margin-bottom: 0 !important; }
    a { color: ${link}; }
    h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }
    h1:first-child { margin-top: 0; }
    p, div, section, article { margin-top: 0.5em; margin-bottom: 0.5em; }
    p:first-of-type, div:first-of-type { margin-top: 0.25em; }
  </style>
</head>
<body>${html}</body>
</html>`;
}
