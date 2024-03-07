import { Env, ZeAppListItem } from '../env';
import { Snapshot, ZeAppRemoteVersions, ZeAppVersion, ZeAppVersionItem } from 'zephyr-edge-contract';

export async function getAppVersion(request: Request, env: Env) {
	const url = new URL(request.url);

	const snapshot = await env.ze_envs.get<Snapshot>(url.hostname, 'json');
	if (!snapshot) {
		return new Response(`app for '${url.host}' not found`, { status: 404 });
	}
	const zeApp = await env.ze_app_list.get<ZeAppListItem>(snapshot.app_id, 'json');

	if (!zeApp) {
		return new Response(`app '${snapshot.app_id}' not found`, { status: 404 });
	}

	// todo: tags temporary generation until ze api integration
	const getUser = (version: ZeAppVersionItem) =>
		Object.assign({}, version, {
			author: 'Akhan Janabekov',
			createdAt: Date.now(),
		});
	// todo: tags temporary generation until ze api integration

	const response: ZeAppVersion = {
		id: zeApp.id,
		app: snapshot.app_id,
		versions: zeApp.versions,
		version: snapshot.version,

		// tags
		tags: {
			latest: getUser(zeApp.versions[1] ?? zeApp.versions[0]),
			next: getUser(zeApp.versions[0]),
		} as ZeAppVersion['tags'],
		snapshot: {} as ZeAppVersion['snapshot'],
	};

	// todo: flatten remotes list and resolve remote app names via API and
	if (snapshot?.mfConfig?.remotes) {
		const remoteKeys = Object.keys(snapshot.mfConfig.remotes);
		const temp = snapshot.app_id.split('.');
		temp.shift();
		const resolvedAppNames = await Promise.all(
			remoteKeys
				.map((key) =>
					[
						key.replace(/[^a-zA-Z0-9-_]/gi, '_'),
						// .replace(/\W/gi, '_'),
						...temp,
					].join('.'),
				)
				.map((hostname) => env.ze_app_list.get<ZeAppRemoteVersions>(hostname, 'json')),
		);
		const remotes = remoteKeys.reduce(
			(memo, key, currentIndex) => {
				const app_version = resolvedAppNames[currentIndex];
				if (!app_version?.versions[0]) return memo;
				// todo: @valorkin set current version at build time
				const version = resolvedAppNames[currentIndex]?.versions[0].version;

				memo[key] = Object.assign({}, resolvedAppNames[currentIndex], {
					tags: {
						latest: getUser(app_version.versions[1] ?? app_version.versions[0]),
						next: getUser(app_version.versions[0]),
					},
					currentVersion: version,
				});

				return memo;
			},
			{} as Record<string, ZeAppRemoteVersions | null>,
		);

		response.snapshot = {
			mfConfig: { remotes },
		};
	}

	return new Response(JSON.stringify(response), {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
		},
		status: 200,
	});
}
