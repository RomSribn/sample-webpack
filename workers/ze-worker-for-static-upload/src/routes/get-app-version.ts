import { Env } from '../index';
import { getAppNameFromHostname } from '../utility/util-get-app-name-from-hostname';
import { getDeploymentDomain } from '../utils/get-deployment-domain';

function _safeToUrl(str: string) {
	try {
		return new URL(str);
	} catch (e) {
		return null;
	}
}

export async function getAppVersion(request: Request, env: Env) {
	const url = new URL(request.url);
	const app = getAppNameFromHostname(url);
	if (!app) {
		return new Response('App Not Found', { status: 404 });
	}

	const tasks = [];
	if (app.indexOf('_') === -1) {
		tasks.push(env.ze_tags.get(app, { type: 'json' }));
		tasks.push(Promise.resolve({}));
	} else {
		const [app_name, user, version] = app.split('_');
		tasks.push(env.ze_tags.get(app_name, { type: 'json' }));
		tasks.push(env.ze_snapshots.get(app, { type: 'json' }));
	}

	tasks.push(env.ze_snapshots.list({ limit: 100 }));

	const [tag, snap, list] = await Promise.all<any>(tasks);

	// todo: remove assets from tags
	if (tag?.tags) {
		tag.tags = Object.keys(tag.tags).reduce((memo, key) => {
			tag.tags[key].assets = void 0;
			memo[key] = tag.tags[key];
			return memo;
		}, {} as Record<string, any>);
	}

	if (!tag && snap) {
		snap.assets = void 0;
	}

	// version
	const version = snap?.id || tag?.tags['latest']?.id;
	const [app_name, user, build] = version.split('_');
	tag.version = version;
	tag.user = user;
	tag.build = build;
	tag._version = [user, build].join('_');

	tag.snapshot = Object.keys(snap).length ? snap : tag.tags['latest'];
	tag.snapshot.assets = void 0;

	// todo: add versions from list to tags.versions
	// todo: use sorting by creation date
	if (tag?.versions) {
		const _app_name = tag.app;
		const _reg_exp = new RegExp(`^${_app_name}`);
		tag.versions = list.keys
			.filter((key) => _reg_exp.test(key.name))
			.map((key) => key.name)
			.sort((a, b) => (a > b ? -1 : 1));
	}

	// todo: map remotes properly
	if (tag.snapshot?.mfConfig?.remotes) {
		// todo: we will need more info about host and remotes
		// git org/repo/packagenamee
		const mfConfig = tag.snapshot.mfConfig;
		const originURL = new URL(request.url);
		const zedomain = getDeploymentDomain(originURL.hostname);
		let memo = {} as Record<string, any>;
		for (const remote of Object.keys(mfConfig.remotes)) {
			const fallback = mfConfig.remotes[remote];
			// todo: if we have an object here already
			if (typeof fallback !== 'string') {
				continue;
			}

			// remote pathname
			const url = _safeToUrl(fallback);
			if (!url) {
				continue;
			}
			const pathname = url.pathname;

			// create app name
			const hardcode = 'valorkin-zephyr-mono';
			const remoteAppName = [hardcode, remote].join('-');

			const remoteTag = await env.ze_tags.get<any>(remoteAppName, { type: 'json' });
			const version = remoteTag?.tags?.latest?.id;
			const versionURL = new URL(request.url);
			versionURL.hostname = [version, zedomain].join('.');
			versionURL.pathname = pathname;
			versionURL.search = '';

			// create container edge url

			const newURL = new URL(request.url);
			newURL.hostname = [remoteAppName, zedomain].join('.');
			newURL.pathname = pathname;
			newURL.search = '';
			const latest = newURL.toString();

			// list of available versions
			const _reg_exp = new RegExp(`^${remoteAppName}`);
			const versions = list.keys
				.map((key) => key.name)
				.filter((key) => _reg_exp.test(key))
				.map((key) => ({ name: key, url: [key, zedomain].join('.') }))
				.sort((a, b) => (a.name > b.name ? -1 : 1));
			// [{name: '', url: ''}]

			memo[remote] = {
				name: remoteAppName,
				url: versionURL.toString(),
				versions,
				fallback,
				latest,
				version,
			};
		}

		Object.assign(mfConfig.remotes, memo);
	}

	return new Response(JSON.stringify(tag), {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
		},
		status: 200,
	});
}
