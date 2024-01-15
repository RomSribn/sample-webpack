const regex = /^.*(edge\.local|(cf|aws)\.valorkin\.dev)/;
export function getDeploymentDomain(hostname: string): string {
	const match = hostname.match(regex);
	if (!match) {
		return hostname;
	}

	return match[1];
}
