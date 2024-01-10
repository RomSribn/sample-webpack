import { loginWithLink } from '../../../../zephyr-side-panel/src/app/auth/authorization';

function getLoginBtn() {
  return document.getElementById('login-btn');
}

function setLoginBtnLoading() {
  const loginBtn = getLoginBtn();
  if (!loginBtn) {
    return;
  }

  loginBtn.setAttribute('disabled', 'true');
  loginBtn.innerText = 'Loading ...';
}

export function loginBtnClickEvent() {
  const loginBtn = getLoginBtn();
  if (!loginBtn) {
    return;
  }

  loginBtn.addEventListener('click', () => {
    setLoginBtnLoading();

    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      loginWithLink(tabs[0].url);
    });
  });
}

export function showLoginBtn({parent, isLoading}: {parent: HTMLElement, isLoading: boolean}) {
  parent.innerHTML = `
      <div class="authorization-box">
        <button class="activeButton" id="login-btn">Login</button>
      </div>
      `;
  if (isLoading) {
    setLoginBtnLoading();
  } else {
    loginBtnClickEvent();
  }
}
