export async function getActiveTabUrl(
  url?: string
): Promise<string | undefined> {
  try {
    if (url) {
      return new URL(url).origin;
    }

    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

    return new URL(tabs[0]?.url ?? '').origin;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
