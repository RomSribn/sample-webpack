import type {
  DurableObjectNamespace, DurableObjectState,
  Request
} from '@cloudflare/workers-types';

export interface Env {
  ZE_BUILD_COUNTER: DurableObjectNamespace;
}

// Worker

export default {
  async fetch(request: Request, env: Env) {
    let url = new URL(request.url);
    // todo: git-author, git-repo,app_name
    // todo: here we can check for user auth and limits
    let name = url.searchParams.get('key');
    if (!name) {
      return new Response('Missing key', { status: 400 });
    }

    let id = env.ZE_BUILD_COUNTER.idFromName(name);

    let obj = env.ZE_BUILD_COUNTER.get(id);

    // Send a request to the Durable Object, then await its response.
    let resp = await obj.fetch(request.url);
    let buildId = await resp.text();

    return new Response(JSON.stringify({ [name]: buildId }), { headers: { 'content-type': 'application/json' },  status: 200 });
  }
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
