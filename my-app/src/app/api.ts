import { IAppResponseData } from "./interfaces/interfaces";
import { applicationsData } from "./constantValue";

const AUTH0_DOMAIN = 'dev-dauyheb8iq6ef5la.us.auth0.com';
const domain = AUTH0_DOMAIN;

export async function isTokenValid(token: string): Promise<void> {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    }
  };
  const user = await fetch(`https://${domain}/userinfo`, config);
  return new Promise<void>((resolve, reject) => {
    user.status === 200 ? resolve() : reject();
  });
}

export async function getAppData(token: string): Promise<IAppResponseData[]> {
  return new Promise<IAppResponseData[]>((resolve, reject) => {
    if (token && applicationsData) {
      setTimeout(() => {
        resolve(applicationsData);
      }, 3000)
    } else {
      reject()
    }
  })
}

export async function publishAppVersion() {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 3000);
  })

}

