import { __debug_active_tab_url, __isDebug } from './_debugger';

export async function getActiveTabUrl(
  url?: string
): Promise<string | undefined> {
  if (__isDebug) {
    return __debug_active_tab_url();
  }

  if (url) {
    return url;
  }

  if (chrome.tabs === undefined) {
    return window.location?.href;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

  return tabs.length > 0 ? tabs[0].url : '';
}
