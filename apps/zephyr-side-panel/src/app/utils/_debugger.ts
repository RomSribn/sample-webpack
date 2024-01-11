export const __isDebug = chrome.tabs === undefined;

let __tab_url = 'http://valorkin-zephyr-mono-team-red.edge.local:8787/';

export function __debug_active_tab_url() {
  return __tab_url;
}

export function __debug_navigate(url: string) {
  console.log(`navigate to ${url}`);
  __tab_url = url;
}
