import { getItem, init } from 'node-persist';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ZE_PATH = `.zephyr`;

const enum StorageKeys {
  zetoken = 'ze-token',
}

const storage = init({
  dir: join(homedir(), ZE_PATH),
});

export async function getToken(): Promise<string | undefined> {
  await storage;
  return getItem(StorageKeys.zetoken);
}
