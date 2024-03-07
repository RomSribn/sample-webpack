interface GetZeAppFromUri {
	domain: string;
	full_app_name: string | undefined;
	org_name: string;
	repo_name: string;
	app_name: string;
	version: string;
}

export function getZeApp(url: URL): GetZeAppFromUri {
	// remove http:// and https://
	const host = url.hostname.replace(/http(s?):\/\//, '');
	// remove port part
	const host_no_port = host.split(':')[0];
	// remove path part
	const host_parts = host_no_port.split('/')[0];
	// split domain part
	const domain_parts = host_parts.split('.');
	// remove app version name
	let full_app_name = domain_parts.shift();
	if (full_app_name?.indexOf('-') === -1) {
		domain_parts.unshift(full_app_name);
		full_app_name = '';
	}
	const domain = domain_parts.join('.');

	const [org_name, repo_name, app_name, version_info] = [...(full_app_name?.split('-') || [])];

	return {
		full_app_name,
		domain,
		org_name,
		repo_name,
		app_name,
		version: version_info,
	};
}
