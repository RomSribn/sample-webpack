export interface IMapedData {
  appLevel: IAppLevel;
  tagLevel: ITagLevel;
  versionLevel: IVersionLevel;
  remotesLevel: IRemotesLevel[];
}

export interface IAppLevel {
  containerId: string;
  inputId: string;
  listId: string;
  currentValue: string;
  fieldListName: string;
  controllerName: string;
  options: {
    name: string;
    id: string;
  }[]
}



export interface ITagLevel {
  containerId: string;
  inputId: string;
  listId: string;
  fieldListName: string;
  currentValue: string;
  controllerName: string;
  options: {
    name: string;
    id: string;
    version: string;
  }[]
}

export interface IVersionLevel {
  containerId: string;
  inputId: string;
  listId: string;
  currentValue: string;
  fieldListName: string;
  controllerName: string;
  options: {
    name: string;
    id: string;
    tag: string;
  }[]
}





export interface IRemotesLevel {
  containerId: string;
  inputId: string;
  listId: string;
  currentValue: string;
  fieldListName: string;
  controllerName: string;
  remoteName: string;
  options: {
    name: string;
    id: string;
  }[]
}
