export interface ZeAppListItem {
	id: string;
	name: string;
	versions: Array<{
		id: string;
		version: string;
		url: string;
	}>;
	domain: string;
}

export interface Env {
	ze_envs: KVNamespace;
	ze_snapshots: KVNamespace;
	ze_files: KVNamespace;
	JWT_SECRET: string;
}
