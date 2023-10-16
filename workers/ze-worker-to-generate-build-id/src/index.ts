export interface Env {
}

export default {
  // produce
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

    return new Response('Sent message to the queue');
  },

};
