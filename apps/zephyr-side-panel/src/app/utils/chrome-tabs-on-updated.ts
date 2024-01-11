import { __isDebug } from './_debugger';

type Tab = chrome.tabs.Tab;
type OnUpdateCallback = (tabId: number, changeInfo: object, tab: Tab) => void;

export function tabsOnUpdated(cb: OnUpdateCallback) {
  if (__isDebug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cb(1, {}, {} as any);
  }
  chrome.tabs.onUpdated.addListener(cb);
  chrome.tabs.onActivated.addListener(function ({ tabId }) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs.length) return;

      const tab = tabs.find((tab) => tab.id === tabId) || tabs[0];

      return cb(tab.id as number, {}, tab);
    });
  });
}
