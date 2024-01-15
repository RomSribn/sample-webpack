import { Env } from '../index';

// todo: check if file exists - do nothing
// todo: use html and custom tags to store file metadata for response headers and filename

function getSafeMeta(str: string) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return {};
	}
}

export async function postUploadFile(request: Request, env: Env) {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');

	if (!id) {
		return new Response('Missing file id', { status: 400 });
	}

	const fileName = request.headers.get('x-file-path');
	const meta = getSafeMeta(request.headers.get('x-file-meta') || '{}');

	const reader = await request.arrayBuffer();

	await env.ze_files.put(id, reader, { metadata: meta });

	return new Response(JSON.stringify({ message: `file ${fileName} uploaded` }), { status: 200 });
}
