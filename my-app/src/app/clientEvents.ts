import { loginWithLink } from "./authorization";

export function loginBtnClickEvent() {
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click',  () => {
      loginBtn.setAttribute("disabled", 'true');
      loginBtn.innerText = 'Loading ...';
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        loginWithLink(tabs[0].url);
      });
    })
  }
}

export function setActionButtonsEventListeners(publishCallBack: () => {}, previewCallBack: () => {}) {
  const publishBtn = document.getElementById('publishBtn') as HTMLElement;
  publishBtn.addEventListener('click',  publishCallBack);
  const previewBtn = document.getElementById('previewBtn') as HTMLElement;
  previewBtn.addEventListener('click',  previewCallBack);
}
