import { jwtVerify, importJWK } from 'jose';

import { postUploadSnapshot } from './routes/post-upload-snapshot';
import { postUploadFile } from './routes/post-upload-file';
import { getWildcard } from './routes/get-wildcard';
import { postUploadEnvs } from './routes/post-upload-envs';
import { Env } from './env';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const type = url.searchParams.get('type');

		if (request.method === 'POST') {
			const token = request.headers.get('can_write_jwt');
			if (!token) {
				return new Response('Please login in Zephyr', { status: 403 });
			}

			const _public_token = await importJWK(JSON.parse(env.JWT_SECRET), 'RS256');
			const { payload, protectedHeader } = await jwtVerify<{
				application_uid: string;
				can_write: boolean;
				username: string;
			}>(token, _public_token);
			const { can_write, username, application_uid } = payload;

			if (!can_write) {
				return new Response(
					JSON.stringify({
						message: `User ${username} is not allowed to update ${application_uid}`,
						status: 403,
					}),
				);
			}
		}

		// Route the request based on the HTTP method and action type
		switch (request.method) {
			case 'POST':
				switch (type) {
					case 'snapshot':
						return postUploadSnapshot(request, env);
					case 'file':
						return postUploadFile(request, env);
					case 'envs':
						return postUploadEnvs(request, env);
					default:
						return new Response('Not Implemented', { status: 501 });
				}
			case 'HEAD':
			case 'GET':
				return getWildcard(request, env);
			default:
				return new Response('Method Not Allowed', {
					status: 405,
					headers: { Allow: 'POST, GET' },
				});
		}
	},
};
