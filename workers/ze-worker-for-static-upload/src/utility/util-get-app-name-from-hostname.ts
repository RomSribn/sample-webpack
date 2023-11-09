export function getAppNameFromHostname(url: URL) {
  const regex = /^(.+?)(\.edge\.local|\.(cf|aws)\.valorkin\.dev)/;
  const appMatch = url.hostname.match(regex);
  if (!appMatch) {
    return void 0;
  }
  if (/\.edge\.local/.test(url.hostname)) {
    return appMatch[1];
  }
  return appMatch[2];
}
