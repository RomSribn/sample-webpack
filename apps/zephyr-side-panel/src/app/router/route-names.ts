export enum RouteNames {
  HOME = '/',
  APPLICATION = '/application',
  ENVIRONMENT = '/environment',
  WHITELABELING = '/whitelabeling',
  ABTESTING = '/ab-testing',
  DOCUMENTATION = '/documentation',
}

export const routeTitles = {
  [RouteNames.APPLICATION]: 'Application',
  [RouteNames.ENVIRONMENT]: 'Environment',
  [RouteNames.WHITELABELING]: 'Whitelabeling',
  [RouteNames.ABTESTING]: 'A/B testing',
  [RouteNames.DOCUMENTATION]: 'Documentation',
};
