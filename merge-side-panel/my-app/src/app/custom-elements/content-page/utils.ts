import { DataList } from "../../dataList/dataListClass";

// export function getFormContent(): string {
//   return `
//     <div class="header">
//       <h3>Application</h3>
//       <div id="badge-box" class="badge-box">
//         <div class="status-badge success"><img src="assets/icons/green-check.png" alt=""> Deployed</div>
//       </div>
//     </div>
//     <form name="appForm"></form>
//     <div id="action-btn-block" class="action-btn-block">
//         <button class="field" disabled>Publish</button>
//         <button disabled>Preview Build</button>
//     </div>
//   `
// }

export function getDeployedBadge(isDeployed: boolean) {
  const deployed = '<div class="status-badge success"><img src="assets/icons/green-check.png" alt=""> Deployed</div>';
  const notDeployed = '<div class="status-badge warning"><img src="assets/icons/warning-icon.png" alt=""> Not Deployed</div>';
  const res = isDeployed ?  deployed : notDeployed;
  document.getElementById('badge-box').innerHTML = res;
}

export function setActionButtons(isDeployed: boolean) {
  const res = isDeployed
    ?
    `<button class="field" disabled id="publishBtn">Publish</button><button disabled id="previewBtn">Preview Build</button>`
    :
    `<button class="field" id="publishBtn">Publish</button><button id="previewBtn">Preview Build</button>`
  document.getElementById('action-btn-block').innerHTML = res;
}

export function getDataListHtml(controllerName, containerId, inputId, listId, defaultInputValue, showNewTabIcon?: boolean): string {
  const newTabIcon = `<img src="assets/icons/new-tab.png" alt="" class="new-tab-icon">`
  return `
    <div id=${containerId} class="dataList">
      ${showNewTabIcon ? newTabIcon : ''}
      <input id=${inputId} type="text" value=${defaultInputValue} name=${controllerName} class="dataList-input">
      <img src="assets/icons/arrow-down.png" alt="" class="arrow-down-icon">
      <ul id=${listId} class="dataList-ul"></ul>
    </div>
  `
}



export function getInputFieldHTML(fieldListName: string, title: string, dataListConfig: {controllerName: string, containerId: string, inputId: string, listId: string, currentValue: string}): string {
  const showNewTabIcon = !!(fieldListName !== 'appLevel' && fieldListName !== 'tagLevel');
  return `
      <fieldset name=${fieldListName}>
        <label>${title}</label>
        ${getDataListHtml(dataListConfig.controllerName, dataListConfig.containerId, dataListConfig.inputId, dataListConfig.listId, dataListConfig.currentValue, showNewTabIcon)}
      </fieldset>
    `
}

export function generateConfigForHtml(data): {controllerName: string, containerId: string, inputId: string, listId: string, currentValue: string} {
  return {
    controllerName: data.controllerName,
    containerId: data.containerId,
    inputId: data.inputId,
    listId: data.listId,
    currentValue: data.currentValue
  }
}

export function createNewDataList(data, checcheckCallBackk, newTagCreatedCallback, iconNewTabClickedCallback) {
  const datalist = new DataList(
    data.containerId,
    data.inputId,
    data.listId,
    data.options,
    checcheckCallBackk,
    data.controllerName,
    data.fieldListName,
    newTagCreatedCallback,
    iconNewTabClickedCallback
  );
  datalist.create();
  datalist.addListeners(datalist);
}



export function addDisabledLay() {
  const elem = `<div class="disabled-lay"></div>`;
  const rootContentBox = document.getElementById('content-box') as HTMLElement;
  rootContentBox.innerHTML += elem;
}
