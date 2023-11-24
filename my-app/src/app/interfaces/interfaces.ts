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

export interface IAppResponseData {
  app: string;
  versions: {[key: string]: string};
  tags: {[key: string]: ITagResponseData};
}

export interface ITagResponseData {
  "id": string;
  "type": string;
  "creator": {
    "name": string;
    "email": string;
    "branch": string;
    "commit": string;
  };
  "createdAt": number;
  "assets": {
    [key: string]: {
      "path": string;
      "extname": string;
      "hash": string;
      "size": number;
      "remotes"?: {
        [key: string]: {
          "name":  string;
          "id":  string;
          "versions": {
            [key: string]:  string;
          },
        }
      }
    }
  }
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

export interface ICurrentValue {
  appLevel: string;
  tagLevel: string;
  versionLevel: string;
  remoteLevel: IRemoteCurrentValue;
}

export interface IRemoteCurrentValue{
  [key: string]: {
    name: string;
    id: string;
  }
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
