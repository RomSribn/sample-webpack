import { Env } from '../index';

interface TagLoad {
	tag: string;
	snapshot: string;
	app: string;
	user: string;
}

export interface TagsHeader {
	app: string;
	versions: Record<string, string>;
	tags: Record<string, any>;
	updatedAt: number;
}

export async function postUploadTags(request: Request, env: Env) {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');

	if (!id) {
		return new Response('Missing file id', { status: 400 });
	}

	const newTag = await request.json<TagLoad>();
	const snapshot = await env.ze_snapshots.get(newTag.snapshot, { type: 'json' });
	const currentTags = await env.ze_tags.get<TagsHeader>(newTag.app, { type: 'json' });
	if (!snapshot) {
		return new Response('Snapshot Not Found', { status: 404 });
	}
	const tags = {
		app: newTag.app,
		versions: Object.assign({}, currentTags?.versions, {
			[newTag.tag]: newTag.snapshot,
		}),
		tags: Object.assign({}, currentTags?.tags, {
			[newTag.tag]: snapshot,
		}),
	};

	await env.ze_tags.put(newTag.app, JSON.stringify(tags));

	return new Response(
		JSON.stringify({
			message: `edge:deploy:done: for app '${newTag.app}', version of tag '${newTag.tag}' set to snapshot '${newTag.snapshot}'`,
		}),
		{ status: 200 }
	);
}
