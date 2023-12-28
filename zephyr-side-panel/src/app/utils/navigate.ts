import { __debug_navigate, __isDebug } from './_debugger';

export async function navigate(url: string) {
  if (__isDebug) {
    __debug_navigate(url);
    return;
  }

  if (!chrome.tabs) {
    window.location.assign(url);
    return;
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!(tabs?.length > 0 && tabs[0].id)) {
    return;
  }

  await chrome.tabs.update(tabs[0].id, { url: url });
}
