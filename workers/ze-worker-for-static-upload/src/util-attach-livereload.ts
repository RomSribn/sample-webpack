const wsServer = `ws://127.0.0.1:8080/ze/mf/reload`;

const livereloadScript = `
<script defer type="application/javascript">
(function () {
  // Miniflare Live Reload
  var url = new URL('${wsServer}');
  function reload() { location.reload(); }
  function connect(reconnected) {
    var ws = new WebSocket(url);
    if (reconnected) ws.onopen = reload;
    ws.onmessage = function(message) {
      try {
        const payload = JSON.parse(message.data)
        console[payload.entry.logLevel](payload.message)
        if (payload.entry.actionType === "build:deploy:done") {
          // todo: wait for KV populated
          setTimeout(() => reload(), 250);
        }
      } catch (err) {
        console.log(message)
        console.error(err)
      }
    };
    ws.onclose = function(e) {
      e.code === 1012 ? reload() : e.code === 1000 || e.code === 1001 || setTimeout(connect, 1000, true);
    }
  }
  connect();
})();
</script>
`

export class AppendLivereloadHandler {
  element(element: any) {
    element.append(livereloadScript, { html: true });
  }
}
