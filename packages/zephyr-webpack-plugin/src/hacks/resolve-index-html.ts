import { EventEmitter } from 'node:events';

const _index_html_emitted = new EventEmitter();

const _event_name = 'index-html-resolved';

export function resolveIndexHtml(content: string): void {
  _index_html_emitted.emit(_event_name, content);
}

export async function onIndexHtmlResolved(): Promise<string> {
  return new Promise((resolve, reject) => {
    // wait for 1 minute (just in case)
    setTimeout(reject, 60000);
    _index_html_emitted.once(_event_name, resolve);
  });
}
