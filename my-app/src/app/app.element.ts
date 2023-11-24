import './app.element.css';
import { isTokenValid } from "./api";
import { ContentClass } from "./content";
import { loginWithLink } from "./authorization";
// import { tabsUpdatedListener } from "./backgroundListeners";
import { loginBtnClickEvent } from "./clientEvents";
// import * as appsList from "./constantValue.json";

export class AppElement extends HTMLElement {
  protected accessToken: string;
  public accessInterval;
  public intervalID = null;

  // setTabsUpdatedListener() {
    // tabsUpdatedListener();
  // }

  checkIsValidToken () {
      isTokenValid(this.accessToken).then(() => {
        chrome.storage.session.set({accessToken: this.accessToken});
      }).catch(async (err) => {
        this.clearInterval();
        await chrome.storage.session.set({accessToken: null});
        ContentClass.setContent(this.accessToken);
        console.error('error', err);
      })
  };

  clearInterval() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }

  //todo set valid time for inetrval
  setInterval() {
    if (this.accessToken) {
      this.intervalID =  setInterval(() => this.checkIsValidToken(), 600000);
    }
  }

  setStorageListener() {
    chrome.storage.onChanged.addListener((value) => {
      if (value.accessToken) {
        this.accessToken = value.accessToken.newValue;
        ContentClass.setContent(this.accessToken);
        this.clearInterval();
        this.setInterval();
      }
    });
  }

  //todo uncommit if this listener is needed
  // setOnTabActivatedListener() {
  //   chrome.tabs.onActivated.addListener((tabId) => {
  //     console.log('tabs is changed', tabId);
  //   })
  // }

   private async checkAccessTokenAtFirst() {
    const res = await chrome.storage.session.get("accessToken");
     this.innerHTML = `
      <div class="content-box" id="content-box">
      </div>
    `
    if (res.accessToken) {
      await isTokenValid(res.accessToken).then(() => {
        chrome.storage.session.set({accessToken: res.accessToken});
        //todo this suck shouldn't be repeated, but in some way set event doesn't trigger storage listener there., f*ck shit, should be as in catch block, magically it works there
        this.accessToken = res.accessToken;
        ContentClass.setContent(this.accessToken);
        this.clearInterval();
        this.setInterval();
      }).catch(async (err) => {
        this.clearInterval();
        chrome.storage.session.set({accessToken: null});
        console.error('error', err);
      })
      return
    }

     ContentClass.setContent(this.accessToken);
  }

  connectedCallback() {
    this.setStorageListener();
    this.checkAccessTokenAtFirst();
    this.innerHTML = `
      <div class="content-box" id="content-box">
      </div>
    `
  }
}
customElements.define('zephyr-side-panel-root', AppElement);
