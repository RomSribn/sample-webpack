// TYPES ONLY
import type { Socket } from 'socket.io-client';

declare function io(uri: string): Socket;

declare interface Location {
  reload: () => void;
}

declare const location: Location;

// TYPES ONLY

// read from session_store

// Miniflare Live Reload
function livereload_template() {
  const socket = io('${wsServer}');
  (function connect() {
    const room = socket.emit('joinZeMfLivereloadRoom',
      { application_uid: '${application_uid}' });
    room.on('reload', function(message) {
      console.log(message);
      setTimeout(() => location.reload(), 250);
    });
  })();
}

const livereloadScript = (application_uid: string, wsServer: string) => `
<script src="${wsServer}/socket.io/socket.io.js"></script>
<script defer type="application/javascript">
  (function () {
    ${livereload_template.toString()
  .replace('function livereload_template() {\n', '')
  .replace(new RegExp(/;[^)}]+}$/), '')
  .replace('${wsServer}', wsServer)
  .replace('${application_uid}', application_uid)
}
  })();
</script>
`;

function ws_server_url(livereload: string) {
  const wsServer = `https://api.zephyr-cloud.io`;
  const devWsServer = `https://api-dev.zephyr-cloud.io`;
  const localWsServer = 'http://127.0.0.1:3333'
  switch (livereload) {
    case 'local': return localWsServer;
    case 'dev': return devWsServer;
    default: return wsServer;
  }
}

export class AppendLivereloadHandler {
  wsServer: string;
  constructor(private readonly app_uid: string, livereload: string) {
    this.wsServer = ws_server_url(livereload);
  }

  element(element: any) {
    element.append(livereloadScript(this.app_uid, this.wsServer), { html: true });
  }
}
