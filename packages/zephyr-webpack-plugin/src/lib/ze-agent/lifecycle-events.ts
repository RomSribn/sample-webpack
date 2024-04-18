import { EventEmitter } from 'node:events';

const _lifecycle_events = new EventEmitter();

const _deployment_done = 'deployment-done';

export function emitDeploymentDone(): void {
  _lifecycle_events.emit(_deployment_done);
}

export async function onDeploymentDone(): Promise<string> {
  return new Promise((resolve) => {
    _lifecycle_events.once(_deployment_done, resolve);
  });
}
