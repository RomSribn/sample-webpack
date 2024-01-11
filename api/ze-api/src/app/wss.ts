import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  host: '127.0.0.1',
  path: '/ze/mf/reload',
  port: 8080,
});

wss.on('connection', function connection(ws, req) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
});

export { wss };
