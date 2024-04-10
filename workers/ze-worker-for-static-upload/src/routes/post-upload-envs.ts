import { Env, ZeAppListItem } from '../env';
import { Snapshot, ZeEnvs } from 'zephyr-edge-contract';
import { importJWK, jwtVerify } from 'jose';

export async function postUploadEnvs(request: Request, env: Env) {
	const _public_token = await importJWK(JSON.parse(env.JWT_SECRET), 'RS256');
	const { payload, protectedHeader } = await jwtVerify<ZeEnvs>((await request.json<ZeEnvs>()).jwt, _public_token);
	const {
		app_version: { application_uid, snapshot_id },
		url_ids,
	} = payload;

	const snapshot = await env.ze_snapshots.get<Snapshot>(snapshot_id, 'json');
	if (!snapshot) {
		return new Response(`Ze: snapshot ${snapshot_id} not found`, { status: 404 });
	}

	const snap_exists = await env.ze_snapshots.get(snapshot_id, 'stream');
	if (!snap_exists) {
		await env.ze_envs.put(snapshot_id, JSON.stringify(snapshot));
	}

	await Promise.all(url_ids.filter((url) => url !== snapshot_id).map(async (url) => await env.ze_envs.put(url, JSON.stringify(snapshot))));

	return new Response(JSON.stringify({ message: `edge:deploy:done for ${snapshot_id}` }));
}
