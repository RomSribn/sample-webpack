import 'dotenv/config';
import { before, describe } from 'node:test';

import app, { cleanEnd, cleanStart } from './app';

describe('Example', () => {
  beforeAll(async () => {
    await cleanStart();
  });
  afterAll(async () => {
    await cleanEnd();
  });
  it('POST /logs/:appId', async () => {
    const res = await app.request('/logs/myId');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Many logs');
  });
});
