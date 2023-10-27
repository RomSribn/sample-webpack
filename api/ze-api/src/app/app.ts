import {Hono} from 'hono';
import {logger} from 'hono/logger'

import './wss';
import {logs} from './router/logs';
import {viewLogs} from './router/view-logs/view-logs';

import {client} from "./repository/_db";

const app = new Hono()

// app.use('*', logger());

// registry of apps routes
logs(app);
viewLogs(app);
export default app;

export async function cleanStart() {
    await client.connect();
}

export async function cleanEnd() {
    await client.end();
}
