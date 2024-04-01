export async function getActiveTabUrl(url?: string): Promise<string> {
  if (url) {
    return url;
  }

  if (chrome.tabs === undefined) {
    return window.location?.href;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

  return tabs.length > 0 && tabs[0].url ? tabs[0].url : '';
}
