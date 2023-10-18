import template from './template';

export interface Env {
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  ze_activity_log: Queue;
}

let count = 0
let ws;
async function handleSession(websocket) {
  websocket.accept()
  websocket.addEventListener("message", async ({ data }) => {
    if (data === "CLICK") {
      count += 1
      websocket.send(JSON.stringify({ count, tz: new Date() }))
    } else {
      // An unknown message came into the server. Send back an error message
      websocket.send(JSON.stringify({ error: "Unknown message received", tz: new Date() }))
    }
  })

  websocket.addEventListener("close", async evt => {
    // Handle when a client closes the WebSocket connection
    console.log(evt)
  })
}
async function websocketHandler(request) {
  const upgradeHeader = request.headers.get("Upgrade")
  if (upgradeHeader !== "websocket") {
    return new Response("Expected websocket", { status: 400 })
  }

  const [client, server] = Object.values(new WebSocketPair())
  await handleSession(server)

  return new Response(null, {
    status: 101,
    webSocket: client
  })
}

export default {
  // produce
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(req.url)
      console.log(JSON.stringify(url));
      switch (url.pathname) {
        case '/':
          return template()
        case '/ws':
          return await websocketHandler(req)
        default:
          return new Response("Not found", { status: 404 })
      }
    } catch (err) {
      return new Response(err.toString())
    }

    switch (req.method) {
      case 'POST':
        const body = await req.json();
        const {author, logLevel, actionType, message, json, createdAt} = body;
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
  async queue(batch: MessageBatch<Error>, env: Env): Promise<void> {
    for (let message of batch.messages) {
      console.log(`message ${message.id} processed: ${JSON.stringify(message.body)}`);
    }
  },
};
