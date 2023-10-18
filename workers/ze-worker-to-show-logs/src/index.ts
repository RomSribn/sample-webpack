export interface Env {
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  ze_activity_log: Queue;
}

export default {
  // produce
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    await env.ze_activity_log.send({
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
    });
    return new Response('Sent message to the queue');
  },

  // consume
  async queue(batch: MessageBatch<Error>, env: Env): Promise<void> {
    for (let message of batch.messages) {
      console.log(`message ${message.id} processed: ${JSON.stringify(message.body)}`);
      message.ack();
    }
  },
};
