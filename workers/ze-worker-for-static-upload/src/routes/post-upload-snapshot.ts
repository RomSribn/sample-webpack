import { Env } from '../index';

// todo: use proper status codes

// 1. we get snapshot object from plugin
// 2. if snapshot id in kv and same owner - do nothing
// todo: this is not possible right now because snap id is based on content
// todo: get back here where you will have tags and list of versions
// 3. if snapshot id in kv and different owner - make copy
// todo: uncomment later
// return new Response(JSON.stringify(response), { status: 200 });
// 4. if snapshot id not in kv - create snapshot in kv - hint json type
// todo: use tags to store versions
// 5. check that we have all file hashes in r2 or kv
// 6. if all files in bucket - return empty list of hashes
// 7. if some files not in bucket - return list of hashes to be uploaded

interface SnapshotTemp {
  id: string;
  assets: Record<string, any>;
  message: string;
}

export async function postUploadSnapshot(request: Request, env: Env) {
  const newSnapshot = await request.json<SnapshotTemp>();
  const response = { id: newSnapshot.id, assets: [], message: '' } as SnapshotTemp;

  await env.ze_snapshots.put(newSnapshot.id, JSON.stringify(newSnapshot));
  const assetPaths = Object.keys(newSnapshot.assets);
  const knownFiles = await Promise
    .all(assetPaths
      .map(async (path: string) =>
        env.ze_files.get(newSnapshot.assets[path].hash, {type: 'stream'})
      ));

  response.assets = knownFiles
    .map((file, index) =>
      file ? null : newSnapshot.assets[assetPaths[index]])
    .filter(Boolean);

  return new Response(JSON.stringify(response), { status: 200 });
}
