import { debug } from 'debug';

const name = 'zephyr';

export const ze_log = debug(`${name}:log`);
export const ze_error = debug(`${name}:error`);
