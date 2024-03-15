import { Env, ZeAppListItem } from '../env';
import { Snapshot, ZeEnvs } from 'zephyr-edge-contract';

export async function postUploadEnvs(request: Request, env: Env) {
	const envs = await request.json<ZeEnvs>();
	// todo: 1. get snapshot by id
	const snapshot = await env.ze_snapshots.get<Snapshot>(envs.snapshot_id, 'json');
	if (!snapshot) {
		return new Response(`Ze: snapshot ${envs.snapshot_id} not found`, { status: 404 });
	}
	// 2. store it as:
	// version, tag, env, cname

	const snap_exists = await env.ze_snapshots.get(envs.snapshot_id, 'stream');
	if (!snap_exists) {
		await env.ze_envs.put(envs.snapshot_id, JSON.stringify(snapshot));
	}

	await Promise.all(
		envs.urls
      .filter((url) => url !== envs.snapshot_id)
      .map(async (url) => await env.ze_envs.put(url, JSON.stringify(snapshot))),
	);

	// todo: replace this with zephyr api calls
	// update app meta in app list with available version list

	const app_meta = await env.ze_app_list
    .get<ZeAppListItem>(snapshot.app_id, 'json');
	const id = `${snapshot.snapshot_id.split('.')[0]}.${snapshot.app_id.split('.')[0]}`;
	const newAppMeta: ZeAppListItem = {
		id,
		name: snapshot.app_id,
		// todo: maybe {version, url}
		versions: [
			{
				id,
				version: snapshot.version,
				url: [snapshot.snapshot_id, snapshot.domain].join('.'),
			},
			...(app_meta?.versions ?? []),
		],
		domain: snapshot.domain,
	};
	await env.ze_app_list.put(snapshot.app_id, JSON.stringify(newAppMeta));
	// todo: end of temp app list block

	return new Response(JSON.stringify({ message: `edge:deploy:done for ${envs.snapshot_id}` }));
}
