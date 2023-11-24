import { addDisabledLay, getDeployedBadge, navigate, setActionButtons } from "./utils/utils";
import { createNewDataList, generateConfigForHtml, getFormContent, getLevelHTML, showLoginBtn } from "./utils/utils";
import {
  IAppResponseData,
  ICurrentValue,
  IMapedData,
  IAppLevel,
  ITagLevel,
  IVersionLevel,
  IRemotesLevel
} from './interfaces/interfaces';
import { getAppData, publishAppVersion } from "./api";
import { setActionButtonsEventListeners } from './clientEvents';

export const FILE_WITH_REMOTES = 'remoteEntry.js';

export class ContentClass extends HTMLElement {
  private static mainContentBox: HTMLElement;
  public static accessToken: string;
  public static data: IAppResponseData[] = [];
  private static currentValues: ICurrentValue = {appLevel: null, tagLevel: null, versionLevel: null, remoteLevel: null};
  private static deployedVersion: ICurrentValue = {appLevel: null, tagLevel: null, versionLevel: null, remoteLevel: null};
  public static mapedObjectData: IMapedData = null;
  public static rootParent = document.getElementById('content-box') as HTMLElement;
  public static isDeployed = true;

  static async getAppData() {
    await getAppData(this.accessToken).then((res) => {
      this.data = res;
    })
  }

  public static newTagCreatedCallback(tag: string) {
    console.log('new tag is here', tag);
  }

  public static async pubLishEventHandler() {
    addDisabledLay();
    await publishAppVersion();
    await this.getAppData();
    this.mainContentBox.innerHTML = getFormContent();
    this.initForm();
    this.getMainContent();

  }

  public static previewEventHandler() {
    console.log('preview');
  }

  static newTabIconEventClickedHandler(fieldListName: string, controller:string): void {
    // chrome.tabs.create({ url: newURL });
  }

  public static isDeploed() {
    if (JSON.stringify(this.currentValues) !== JSON.stringify(this.deployedVersion)) {
      this.isDeployed = false;
      getDeployedBadge(this.isDeployed);
      setActionButtons(this.isDeployed);
      setActionButtonsEventListeners(this.pubLishEventHandler.bind(this), this.previewEventHandler.bind(this));
    } else {
      this.isDeployed = true;
      getDeployedBadge(this.isDeployed);
      setActionButtons(this.isDeployed);
    }
  }

  public static async checkCallBack(val: {fieldList: string; controller: string; value: {name: string; id: string}}) {
    const app = this.data.find(appItem => appItem.app === this.currentValues.appLevel) as IAppResponseData;

    if (val.fieldList === 'appLevel') {
      if (this.currentValues.appLevel !== val.value.name) {
        const app = this.data.find(appItem => appItem.app === val.value.name) as IAppResponseData;
        this.currentValues.appLevel = app.app;
        await chrome.storage.session.set({currentFormValues: this.currentValues});
        this.initForm();
        this.getMainContent();
        // todo uncommit and add verified url;
        // navigate('https://valorkin-ze-mono-team-red.cf.valorkin.dev/')
      }
    }

    if (val.fieldList === 'tagLevel') {
      if (this.currentValues.tagLevel !== val.value.name) {
        this.currentValues.tagLevel = val.value.name;
        this.mapedObjectData.tagLevel = this.getTags(app.tags, true);
        this.mapedObjectData.versionLevel = this.getVersions(app.versions);
        this.mapedObjectData.remotesLevel = this.getRemotes(app.tags);
        await chrome.storage.session.set({currentFormValues: this.currentValues});
        this.getMainContent();
        // todo uncommit and add verified url;
        // navigate('https://valorkin-ze-mono-team-red.cf.valorkin.dev/')
      }
    }

    if (val.fieldList === 'versionLevel') {
      if (this.currentValues.versionLevel !== val.value.name) {
        this.currentValues.versionLevel = val.value.name;
        this.isDeploed();
        this.mapedObjectData.versionLevel = this.getVersions(app.versions, true);
        this.mapedObjectData.remotesLevel = this.getRemotes(app.tags);
        await chrome.storage.session.set({currentFormValues: this.currentValues});
        this.getMainContent();
      }
    }

    if (val.fieldList === 'remoteLevel') {
      console.log('check callback', this.currentValues.remoteLevel[val.controller].id, val.value)
        this.currentValues.remoteLevel[val.controller] = val.value;
        await chrome.storage.session.set({currentFormValues: this.currentValues});
        this.isDeploed();
    }
  }

  private static mapAppLevel(): IAppLevel {
    let resObj = {
      containerId: '',
      inputId: '',
      listId: '',
      currentValue: this.currentValues.appLevel,
      fieldListName: 'appLevel',
      controllerName: 'appControllerName',
      options: []
    }
    this.data.forEach(item => {
      const num = Math.random() + 2.5;
      resObj = {
        ...resObj,
          containerId: 'appLevel' + num,
          inputId: 'appLevel' + '-input-' + num,
          listId: 'appLevel' + '-list-' + num,
          options: [...resObj.options, {
            name: item.app,
            id: item.app+num
        }]
      }
    });
    if (!this.currentValues.appLevel) {
      this.currentValues.appLevel = this.data[0].app;
      resObj.currentValue = this.currentValues.appLevel;
      chrome.storage.session.set({currentFormValues: this.currentValues});
    }

    return resObj;
  }

  private static getTags(tags, useCurrentSavedValue?: boolean): ITagLevel {
    let resObj = {
      containerId: '',
      inputId: '',
      listId: '',
      currentValue: !useCurrentSavedValue ? null : this.currentValues.tagLevel,
      fieldListName: 'tagLevel',
      controllerName: 'tagControllerName',
      options: []
    };
    Object.keys(tags).forEach((item, index) => {
      const num = Math.random() + 2.5;
      resObj = {
        ...resObj,
        containerId: 'tagsLevel' + num,
        inputId: 'tagsLevel' + '-input-' + num,
        listId: 'tagsLevel' + '-list-' + num,
        options: [...resObj.options, {
          name: item,
          id: item+num,
          version: tags[item]
        }]
      }
    });

    if (!resObj.currentValue) {
      const app = this.data.find((appItem) => appItem.app === this.currentValues.appLevel);
      this.currentValues.tagLevel = Object.keys(app.tags)[0];
      resObj.currentValue = this.currentValues.tagLevel;
      chrome.storage.session.set({currentFormValues: this.currentValues});
    }
    return resObj;
  }

  private static getVersions(appItem, useCurrentSavedValue?: boolean): IVersionLevel {
    let resObj = {
      containerId: '',
      inputId: '',
      listId: '',
      fieldListName: 'versionLevel',
      controllerName: 'versionControllerName',
      currentValue: !useCurrentSavedValue ? null : this.currentValues.versionLevel,
      options: []
    }
    Object.keys(appItem).forEach(item => {
      const num = Math.random() + 2.5;
      resObj = {
        ...resObj,
        containerId: 'versionLevel' + num,
        inputId: 'versionLevel' + '-input-' + num,
        listId: 'versionLevel' + '-list-' + num,
        options: [...resObj.options, {
          name: appItem[item],
          id: appItem[item]+num,
          tag: item
        }]
      }
    });
    if (!resObj.currentValue) {
      const app = this.data.find(itemApp => itemApp.app === this.currentValues.appLevel);
      const tag = Object.keys(app.tags).find(tag => tag === this.currentValues.tagLevel);
      this.currentValues.versionLevel = app.versions[tag];
      resObj.currentValue = app.versions[tag];
      chrome.storage.session.set({currentFormValues: this.currentValues});
    }

    return resObj;
  }

  static getAppLevelHTML(): string {
    const data = this.mapedObjectData.appLevel;
    return getLevelHTML(data.fieldListName, 'Name', generateConfigForHtml(data))
  }

  static getTagLevelHTML(): string {
    const data = this.mapedObjectData.tagLevel;
    return getLevelHTML(data.fieldListName, 'Tag', generateConfigForHtml(data))
  }

  static getVersionsLevelHTML(): string {
    const data = this.mapedObjectData.versionLevel;
    return getLevelHTML(data.fieldListName, 'Version', generateConfigForHtml(data))
  }

  static getRemotesLevelHTML(): string {
    const data = this.mapedObjectData.remotesLevel;
    let resHTML = '';
    data.forEach(item => {
      resHTML += getLevelHTML(item.fieldListName, item.remoteName, generateConfigForHtml(item))
    });
    return resHTML;
  }

  static createDataListForTagsLevel() {
    const data = this.mapedObjectData.tagLevel;
    createNewDataList(data, this.checkCallBack.bind(this), this.newTagCreatedCallback.bind(this), () => {});
  }

  static createDataListForAppLevel() {
    const data = this.mapedObjectData.appLevel;
    createNewDataList(data, this.checkCallBack.bind(this), () => {}, () => {});
  }

  static createDataListForVersionLevel() {
    const data = this.mapedObjectData.versionLevel;
    createNewDataList(data, this.checkCallBack.bind(this), () => {}, this.newTabIconEventClickedHandler.bind(this));
  }

  static createDataListForRemotesLevel() {
    const data = this.mapedObjectData.remotesLevel;
    data.forEach(item => {
      createNewDataList(item, this.checkCallBack.bind(this), () => {}, this.newTabIconEventClickedHandler.bind(this));
    });
  }

  static getRemotes(dataObj): IRemotesLevel[] {
    const tagName = Object.keys(dataObj).find(item => dataObj[item].id === this.currentValues.versionLevel);
    const tagValue = dataObj[tagName];
    if (!tagValue) {
      //todo this flow if needed
      return;
    };

    const remotes = tagValue.assets[FILE_WITH_REMOTES].remotes;
    if (!remotes) {
      //todo this flow if needed
      return;
    };
    const mapedRemotes = [];
    Object.keys(remotes).forEach(item => {
      const num = Math.random() + 0.05;
      const resObj = {
        containerId: `remoteLevel-container-${remotes[item].id}-${num}`,
        inputId: `remoteLevel-inputId-${remotes[item].id}-${num}`,
        listId: `remoteLevel-listId-${remotes[item].id}-${num}`,
        currentValue: this.currentValues.remoteLevel?.[remotes[item].name]?.name || null,
        fieldListName: 'remoteLevel',
        //only on remotes level controller uses as remote name to dedicate needed remote in currentValues
        controllerName: remotes[item].name,
        remoteName: remotes[item].name,
        options: []
      };
      Object.keys(remotes[item].versions).forEach(verKey => {
        resObj.options.push({
          name: remotes[item].versions[verKey],
          id: remotes[item].versions[verKey]
        })
      })
      mapedRemotes.push(resObj);
    })
    const remotesForCurrentVersion = {};
    mapedRemotes.forEach(item => {
      const key = item.remoteName
        remotesForCurrentVersion[key] = !item.currentValue ? item.options[0] : item.options.find(op => op.name === item.currentValue);
        item.currentValue = remotesForCurrentVersion[key].name
    });
    this.currentValues.remoteLevel = remotesForCurrentVersion;
    chrome.storage.session.set({currentFormValues: this.currentValues});
    return mapedRemotes;
  }

  static getMainContent() {
    const form = document.forms[0];
    form.innerHTML = `
      ${this.getAppLevelHTML()}
      ${this.getTagLevelHTML()}
      ${this.getVersionsLevelHTML()}
      <h4>Remotes</h4>
      ${this.getRemotesLevelHTML()}
    `

    this.createDataListForAppLevel();
    this.createDataListForTagsLevel();
    this.createDataListForVersionLevel();
    this.createDataListForRemotesLevel();
  }

  static initForm() {
    let dataObj: IMapedData;
      dataObj = {
        appLevel: this.mapAppLevel(),
      } as IMapedData;
      const currentApp = this.data.find(item => item.app === this.currentValues.appLevel);
      dataObj = {
        ...dataObj,
        tagLevel: this.getTags(currentApp.tags),
        versionLevel: this.getVersions(currentApp.versions),
        remotesLevel: this.getRemotes(currentApp.tags),
      } as IMapedData;

    this.mapedObjectData = dataObj;
    this.deployedVersion = JSON.parse(JSON.stringify(this.currentValues));
    this.isDeploed();
  }

  static validateCurrentValues(storageData: ICurrentValue) {
    if (!storageData?.appLevel) {
      return;
    }

    const validApp = this.data.find(item => item.app === storageData.appLevel);
    if (!validApp) {
      return;
    }

    const validTagName = Object.keys(validApp.tags).find(item => item === storageData.tagLevel);
    if (!validTagName) {
      return;
    }

    const tagVal = validApp.tags[validTagName];

    if (!tagVal || !validApp.versions[validTagName]) {
      return;
    }

    const remotes = tagVal.assets[FILE_WITH_REMOTES].remotes;
    let remoteValidationRes = Object.keys(remotes).every(item => {
      if (!storageData.remoteLevel[item]) {
        return false;
      }

      return  Object.keys(remotes[item].versions).some(verItem => remotes[item].versions[verItem] === storageData.remoteLevel[item].id);
    });

    if (!remoteValidationRes) {
      return;
    }
    this.currentValues = JSON.parse(JSON.stringify(storageData));
  }

  static async setContent(accessToken: string) {
    this.mainContentBox = document.getElementById('content-box');
    this.accessToken = accessToken;
    if (!!accessToken) {
      await this.getAppData();
      this.mainContentBox.innerHTML = getFormContent();
      const storageData = await chrome.storage.session.get("currentFormValues") as ICurrentValue;
      this.validateCurrentValues(storageData)
      this.initForm();
      this.getMainContent();
      return;
    }

    showLoginBtn(this.mainContentBox);
  }
}


