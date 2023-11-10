export function getAppNameFromHostname(url: URL) {
  const regex = /^(.+?)(\.edge\.local|\.(cf|aws)\.valorkin\.dev)/;
  const appMatch = url.hostname.match(regex);
  if (!appMatch) {
    return void 0;
  }
  return appMatch[1];
}
