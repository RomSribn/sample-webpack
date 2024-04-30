interface GetActiveTabUrlParams {
  url?: string;
  /**
   * If true, returns the full URL, otherwise just the origin
   */
  fullUrl?: boolean;
}

export async function getActiveTabUrl({
  url,
  fullUrl
}: GetActiveTabUrlParams = {}): Promise<string | undefined> {
  try {
    if (url) {
      const tabUrl = new URL(url);
      return fullUrl ? tabUrl.href : tabUrl.origin;
    }

    const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
    const tabUrl = new URL(tabs[0]?.url ?? '');

    return fullUrl ? tabUrl.href : tabUrl.origin;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
