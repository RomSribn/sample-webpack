import { ZeAppVersion } from 'zephyr-edge-contract';

import { ApplicationTag } from '../hooks/queries/application-tag';
import { Application } from '../hooks/queries/application';
import { ApplicationVersion } from '../hooks/queries/application-version';

const emptyApplication: Application = {
  application_uid: '',
  name: '',
  remote_host: '',
  organization: {
    name: '',
  },
  project: {
    name: '',
  },
};

const emptyTag: ApplicationTag = {
  name: '',
  author: '',
  version: '',
  createdAt: '',
  application_uid: '',
  snapshot_id: '',
  remote_host: '',
  remote_entry_url: '',
};

const emptyApplicationVersion: ApplicationVersion = {
  name: '',
  author: '',
  version: '',
  createdAt: '',
  application_uid: '',
  snapshot_id: '',
  remote_host: '',
  remote_entry_url: '',
};

const emptyZeApplicationVersion: ZeAppVersion = {
  application_uid: '',
  snapshot_id: '',
  version: '',
  remote_entry_url: '',
  remote_host: '',
  name: '',
  tag: '',
  env: '',
  createdAt: '',
  author: '',
};

export {
  emptyApplication,
  emptyTag,
  emptyApplicationVersion,
  emptyZeApplicationVersion,
};
