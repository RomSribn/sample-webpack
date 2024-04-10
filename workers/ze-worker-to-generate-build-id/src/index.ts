import type { DurableObjectNamespace, DurableObjectState, Request } from '@cloudflare/workers-types';
import { jwtVerify, importJWK } from 'jose';

export interface Env {
	ZE_BUILD_COUNTER: DurableObjectNamespace;
	JWT_SECRET: string;
}
// Worker

export default {
	async fetch(request: Request, env: Env) {
		const token = request.headers.get('can_write_jwt');
		if (!token) {
			return new Response('Please login in Zephyr', { status: 403 });
		}

		const _public_token = await importJWK(JSON.parse(env.JWT_SECRET), 'RS256');
		const { payload, protectedHeader } = await jwtVerify(token, _public_token);

		const { user_uuid, can_write, username, application_uid } = payload as {
			application_uid: string;
			can_write: boolean;
			user_uuid: string;
			username: string;
		};

		if (!can_write) {
			return new Response(
				JSON.stringify({
					message: `User ${username} is not allowed to update ${application_uid}`,
					status: 403,
				}),
			);
		}

		let id = env.ZE_BUILD_COUNTER.idFromName(user_uuid);
		let obj = env.ZE_BUILD_COUNTER.get(id);

		// Send a request to the Durable Object, then await its response.
		let resp = await obj.fetch(request.url);
		let buildId = await resp.text();

		return new Response(JSON.stringify({ [user_uuid]: buildId }), {
			headers: { 'content-type': 'application/json' },
			status: 200,
		});
	},
};

// Durable Object
export class ZeBuildCounter {
	state: DurableObjectState;
	value!: number;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
	}

	// Handle HTTP requests from clients.
	async fetch(request: Request) {
		this.value = this.value || (await this.state.storage.get('value')) || 0;
		this.value++;
		await this.state.storage.put('value', this.value);

		return new Response(this.value.toString());
	}
}
