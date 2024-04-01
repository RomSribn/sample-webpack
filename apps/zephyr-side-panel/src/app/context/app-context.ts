import { Context, createContext, Consumer } from 'react';

interface AppContextType {
  /**
   * user access token
   */
  token: string;
  /**
   * refresh user access token
   */
  refreshToken: () => void;
  /**
   * deployed status of the main application
   */
  isDeployed: boolean;
  /**
   * update deployed status of the main application
   */
  setIsDeployed: (isDeployed: boolean) => void;
  /**
   * url of the main application
   */
  url?: string;
  /**
   * update url of the main application
   */
  setUrl: (url: string) => void;
}

const defaultState: AppContextType = {
  token: '',
  url: '',
  isDeployed: true,
  refreshToken: () => {
    /**/
  },
  setIsDeployed: () => {
    /**/
  },
  setUrl: () => {
    /**/
  },
};

const AppContext: Context<AppContextType> = createContext(defaultState);
const AppProvider = AppContext.Provider;
/**
 * Consumer for app contexts providing.
 * @param {AppContextType['token']} token user access token.
 * @param {AppContextType['refreshToken']} refreshToken update user access token.
 * @param {AppContextType['isDeployed']} isDeployed deployed status of the main application.
 * @param {AppContextType['setIsDeployed']} setIsDeployed update deployed status of the main application.
 * @param {AppContextType['url']} url url of the main application.
 * @param {AppContextType['setUrl']} setUrl update url of the main application.
 */
const AppConsumer: Consumer<AppContextType> = AppContext.Consumer;

export { AppContext, AppProvider, AppConsumer, defaultState };
export type { AppContextType };
