export async function getActiveTabId(): Promise<number | undefined> {
  if (chrome.tabs === undefined) {
    return -1;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

  return tabs.length > 0 ? tabs[0].id : -1;
}
