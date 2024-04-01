import { Context, createContext, Consumer } from 'react';
// types
import { Application } from '../hooks/queries/application';
import { ApplicationVersion } from '../hooks/queries/application-version';
import { ApplicationTag } from '../hooks/queries/application-tag';
// states
import {
  emptyApplication,
  emptyTag,
  emptyApplicationVersion,
} from './empty-state';

enum PublishDataKeys {
  APPLICATION = 'application',
  TAG = 'tag',
  VERSION = 'version',
  REMOTES = 'remotes',
}

type SetDataProp =
  | Application
  | ApplicationTag
  | ApplicationVersion
  | { [key: string]: ApplicationVersion };

interface DataContextType {
  [PublishDataKeys.APPLICATION]: Application;
  [PublishDataKeys.TAG]: ApplicationTag;
  [PublishDataKeys.VERSION]: ApplicationVersion;
  [PublishDataKeys.REMOTES]: { [key: string]: ApplicationVersion };
  /**
   * update current selected data for publish.
   */
  setData: (data: SetDataProp, key: PublishDataKeys) => void;
}

const defaultState: DataContextType = {
  [PublishDataKeys.APPLICATION]: emptyApplication,
  [PublishDataKeys.TAG]: emptyTag,
  [PublishDataKeys.VERSION]: emptyApplicationVersion,
  [PublishDataKeys.REMOTES]: {},
  setData: () => {
    /**/
  },
};

const DataContext: Context<DataContextType> = createContext(defaultState);
const DataProvider = DataContext.Provider;
/**
 * Consumer for data contexts providing.
 * @param {DataContextType['application']} application current selected application data for publish.
 * @param {DataContextType['tag']} tag current selected tag data for publish.
 * @param {AppContextType['version']} version current selected version data for publish.
 * @param {AppContextType['remotes']} remotes current selected remotes data for publish.
 * @param {AppContextType['setData']} setData set current selected data for publish.
 */
const AppConsumer: Consumer<DataContextType> = DataContext.Consumer;

export {
  DataContext,
  DataProvider,
  AppConsumer,
  defaultState,
  PublishDataKeys,
};
export type { DataContextType, SetDataProp };
