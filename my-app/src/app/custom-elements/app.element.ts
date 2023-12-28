import './app.element.css';
import { ContentClass } from './content.element';
import { session } from '../../../../zephyr-side-panel/src/app/storage/session';
import { showLoginBtn } from './login-button';
import { accessToken, disableTokenRefresh, setAccessToken, setStorageListener } from '../../../../zephyr-side-panel/src/app/auth/refresh-token';
import { isTokenValid } from '../../../../zephyr-side-panel/src/app/auth/authorization';

export class AppElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="content-box" id="content-box">
      </div>
    `;
    showLoginBtn({ parent: this, isLoading: !!accessToken() });

    Promise.resolve().then(async () => {
      await this.checkAccessTokenAtFirst();
      await setStorageListener();
    });
  }

  //todo uncommit if this listener is needed
  // setOnTabActivatedListener() {
  //   chrome.tabs.onActivated.addListener((tabId) => {
  //     console.log('tabs is changed', tabId);
  //   })
  // }

  private async checkAccessTokenAtFirst() {
    const token = accessToken() || await session.accessToken;
    this.innerHTML = `
      <div class="content-box" id="content-box">
      </div>
    `;

    if (!token) {
      await ContentClass.setContent(token);
      return;
    }

    await isTokenValid(token)
      .then(() => {
        //todo this suck shouldn't be repeated, but in some way set event doesn't trigger storage listener there., f*ck shit, should be as in catch block, magically it works there
        setAccessToken(token);
        ContentClass.setContent(token);
      })
      .catch(async (err) => {
        await disableTokenRefresh();
        console.error('error', err);
      });
  }

}
