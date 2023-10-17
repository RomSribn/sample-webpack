/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Queue consumer: a Worker that can consume from a
 * Queue: https://developers.cloudflare.com/queues/get-started/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 * https://developers.cloudflare.com/queues/platform/javascript-apis/#producer
 * https://developers.cloudflare.com/queues/get-started/#3-create-a-queue
 * https://developers.cloudflare.com/queues/platform/javascript-apis/#messagebatch
 */

export interface Env {
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  ze_activity_log: Queue;
}

export default {
  // produce
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    switch (req.method) {
      case 'POST':
        const body = await req.json();
        const {author, logLevel, actionType, message, json, createdAt} = body;
        console.log(`received message: ${JSON.stringify(body)} from ${author}`);
        await env.ze_activity_log.send({
          author,
          logLevel,
          actionType,
          message,
          json,
          createdAt,
        });
        break;
      default:
        return new Response('Method not allowed', { status: 405 });
    }


    return new Response('Sent message to the queue');
  },
  // consume
  // async queue(batch: MessageBatch<Error>, env: Env): Promise<void> {
  //   for (let message of batch.messages) {
  //     console.log(`message ${message.id} processed: ${JSON.stringify(message.body)}`);
  //   }
  // },
};
