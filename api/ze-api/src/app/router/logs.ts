import WebSocket from 'ws';
import {client} from '../repository/_db';
import {getEntriesAfterId, getLastTenEntries, insertNewEntry} from '../repository/logs';
import {wss} from '../wss';

/*const samplePostBody = {
    appId: 'mono/sample-react-app',
    zeUserId: 'valorkin',
    zeBuildId: '1234567890',
    logLevel: 'debug',
    actionType: 'build',
    git: {
        name: 'Dmitriy Shekhovtsov',
        email: 'valorkin@gmail.com',
        branch: 'master',
        commit: '1234567890'
    },
    message: 'build deployed in 2ms',
    meta: {isCI: false},
    createdAt: 1697759173516
};*/

export function logs(app) {
    // todo: eventually, this should identify the particular stream of events
    app
        .get('/logs', async (c) => {
            const appId = c.req.query('appId');
            const logId = c.req.query('logId');
            if (!appId) {
                c.status(400);
                return c.text('appId is required')
            }

            if (logId) {
                c.status(200);
                return c.json({
                    appId,
                    logId,
                    logs: await getEntriesAfterId(client, appId, logId)
                });
            }

            return c.json({
                appId,
                logs: await getLastTenEntries(client, appId)
            });
        })
        // todo: add validation of body
        .post('/logs', async (c) => {
            const newEntry = await c.req.json();
            process.nextTick(() => {
                insertNewEntry(client, newEntry);
            });

            const ms = `${Date.now() - newEntry.createdAt}`.padStart(2, ' ');
            const message = `[ze:api:logs]: ${ms}ms ${newEntry.message}`;
            console.log(message)
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({entry: newEntry, message}));
                }
            });
            return c.text(message);
        });
}
