// export function tabsUpdatedListener() {
//   chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab)=> {
//     if (tab.status === 'complete') {
//       chrome.storage.session.set({currentUrl: tab.url});
//       //todo uncomment if it is needed
//       // chrome.runtime.sendMessage({ type: 'UPDATED_TAB_ID', tabId });
//       // chrome.runtime.sendMessage({ type: 'UPDATE_CURRENT_URL', currentUrl: tab.url });
//     }
//   });
// }

// canb deleted if you don't need to check tabs changing
