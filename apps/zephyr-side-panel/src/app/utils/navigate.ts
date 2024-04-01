export async function navigate(url: string) {
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
