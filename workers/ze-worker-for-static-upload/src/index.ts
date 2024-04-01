import { postUploadSnapshot } from './routes/post-upload-snapshot';
import { postUploadFile } from './routes/post-upload-file';
import { getWildcard } from './routes/get-wildcard';
import { postUploadEnvs } from './routes/post-upload-envs';
import { Env } from './env';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const type = url.searchParams.get('type');

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
