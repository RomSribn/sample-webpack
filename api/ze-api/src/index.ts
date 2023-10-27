import 'dotenv/config';

import type {AddressInfo} from 'node:net';
import {serve} from '@hono/node-server'

import app, {cleanStart} from "./app/app";

cleanStart()
    .then(() => {
        const server = serve(app, (info: AddressInfo) => console.log(`Listening on ${info.port}`));
    })


