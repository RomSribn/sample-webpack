export function getAppNameFromHostname(url: URL) {
  const regex = /^(.+?)(\.edge\.local|\.valorkin\.workers\.dev|ze-worker-for-static-upload\.valorkin\.workers\.dev|\.valorkin\.dev)/;
  const appMatch = url.hostname.match(regex);
  if (!appMatch) {
    return void 0;
  }
  return appMatch[1];
}
