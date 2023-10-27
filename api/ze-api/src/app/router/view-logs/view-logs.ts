import {html, raw} from 'hono/html'

// todo: add more granular failure codes
// todo: ${executionContext} - local, ci, edge
// todo: node_env - production, development, test
// todo: report plugin errors!
/*
trace
build:start
[mono/sample-react-app][Dmitriy Shekhovtsov] local build started
[mono/sample-react-app][Dmitriy Shekhovtsov] ci build started

info
build:done
[mono/sample-react-app][Dmitriy Shekhovtsov] local build finished in 2015ms

debug
build:failed
[mono/sample-react-app][Dmitriy Shekhovtsov] local build failed

trace
snapshot:upload:start
[mono/sample-react-app][Dmitriy Shekhovtsov] started uploading of local snapshot to zephyr

1info
snapshot:upload:done
[mono/sample-react-app][Dmitriy Shekhovtsov] uploaded local snapshot to zephyr in 20ms

warn
snapshot:upload:failed
[mono/sample-react-app][Dmitriy Shekhovtsov] failed to upload local snapshot

warn
snapshot:upload:failed
[mono/sample-react-app][Dmitriy Shekhovtsov] failed to upload snapshot

trace
snapshot:assets:upload:start
[mono/sample-react-app][Dmitriy Shekhovtsov] uploading missing assets to zephyr

info
snapshot:assets:upload:done
[mono/sample-react-app][Dmitriy Shekhovtsov] uploaded missing assets to zephyr in 300ms (N files, Z kB)

warn
snapshot:assets:upload:failed
build:upload:assets:failed
[mono/sample-react-app][Dmitriy Shekhovtsov] failed to upload missing assets

info
deploy:edge:done
[mono/sample-react-app][Dmitriy Shekhovtsov] local build deployed to edge in 2335ms

info
deploy:edge:failed
[mono/sample-react-app][Dmitriy Shekhovtsov] failed to deploy local build to edge

* */

export function viewLogs(app) {
    app
        .get(`/view-logs`, async (c) => {
            return c.html(html`Hello World`)
        })
}
