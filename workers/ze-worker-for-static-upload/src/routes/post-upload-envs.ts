import { Env, ZeAppListItem } from '../env';
import { Snapshot, ZeEnvs } from 'zephyr-edge-contract';

export async function postUploadEnvs(request: Request, env: Env) {
	const envs = await request.json<ZeEnvs>();

	const snapshot = await env.ze_snapshots.get<Snapshot>(envs.snapshot_id, 'json');
	if (!snapshot) {
		return new Response(`Ze: snapshot ${envs.snapshot_id} not found`, { status: 404 });
	}

	const snap_exists = await env.ze_snapshots.get(envs.snapshot_id, 'stream');
	if (!snap_exists) {
		await env.ze_envs.put(envs.snapshot_id, JSON.stringify(snapshot));
	}

	await Promise.all(
		envs.urls.filter((url) => url !== envs.snapshot_id).map(async (url) => await env.ze_envs.put(url, JSON.stringify(snapshot))),
	);

	return new Response(JSON.stringify({ message: `edge:deploy:done for ${envs.snapshot_id}` }));
}
