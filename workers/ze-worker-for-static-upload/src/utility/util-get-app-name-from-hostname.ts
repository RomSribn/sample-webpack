const regex = /^(.+?)\.(edge\.lan|(cf|aws)\.valorkin\.dev)/;
export function getAppNameFromHostname(url: URL) {
	const appMatch = url.hostname.match(regex);
	if (!appMatch) {
		return void 0;
	}
	return appMatch[1];
}
