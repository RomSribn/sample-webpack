import { Snapshot, SnapshotUploadRes, ZeBuildAsset } from 'zephyr-edge-contract';
import { Env } from '../env';

// 1. we get snapshot object from plugin + token to check can we write to this urls
// -- if can't write - exit
// 2. put snapshot in KV
// 3. check missing files in KV and return a list of files to upload or empty array
// todo: temporary 4. update app list with versions

export async function postUploadSnapshot(request: Request, env: Env) {
	const newSnapshot = await request.json<Snapshot>();
	const response = { id: newSnapshot.snapshot_id, assets: [], message: '' } as SnapshotUploadRes;

	await env.ze_snapshots.put(newSnapshot.snapshot_id, JSON.stringify(newSnapshot));

	const assetPaths = Object.keys(newSnapshot.assets);
	const knownFiles = await Promise.all(
		assetPaths.map(async (path: string) => env.ze_files.get(newSnapshot.assets[path].hash, { type: 'stream' })),
	);

	response.assets = knownFiles
		.map((file, index) => (file ? undefined : newSnapshot.assets[assetPaths[index]]))
		.filter(Boolean) as ZeBuildAsset[];

	return new Response(JSON.stringify(response), { status: 200 });
}
