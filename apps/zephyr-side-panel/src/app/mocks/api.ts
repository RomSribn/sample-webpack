export interface IAppResponseData {
  app: string;
  versions: { [key: string]: string };
  tags: { [key: string]: ITagResponseData };
}

export interface ITagResponseData {
  id: string;
  type: string;
  creator: {
    name: string;
    email: string;
    branch: string;
    commit: string;
  };
  createdAt: number;
  assets: {
    [key: string]: {
      path: string;
      extname: string;
      hash: string;
      size: number;
      remotes?: {
        [key: string]: {
          name: string;
          id: string;
          versions: {
            [key: string]: string;
          };
        };
      };
    };
  };
}

export async function getAppData(token: string): Promise<IAppResponseData[]> {
  const fetchUrl = 'http://edge.local:8787/__mock_app_data';
  const appData = await fetch(fetchUrl);
  if (!appData.ok) {
    return [];
  }
  return appData.json();
}

export async function publishAppVersion() {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
}
