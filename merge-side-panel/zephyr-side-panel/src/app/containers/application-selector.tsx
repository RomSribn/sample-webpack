import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { RemoteDescriptor } from './remotes-selector';

export interface ApplicationList {
  list: { name: string; url: string }[];
  origin: string;
  zedomain: string;
  cursor: string;
}

export interface ApplicationVersion {
  app: string;
  version: string;
  user: string;
  build: string;
  versions: string[];
  tags: Record<string, { id: string }>;
  snapshot: {
    id: string;
    mfConfig: {
      name: string;
      // todo: remote url should be converted to app descriptor at edge
      // {url: 'edge-url', fallback: 'fallback-url', name: 'app-name', version: 'app-version'}
      remotes: Record<string, RemoteDescriptor>;
    };
  };
}

interface ApplicationSelectorProps {
  appOptions: string[];
  appVersion?: ApplicationVersion;
  onChange: (appName: string | undefined) => void;
}

export function ApplicationSelector({
  appVersion,
  appOptions,
  onChange,
}: ApplicationSelectorProps) {
  return (
    <fieldset name="application">
      <label>Name</label>
      <Autocomplete
        disableClearable={true}
        defaultValue={appVersion?.app}
        onChange={(event, newInputValue) => {
          onChange(newInputValue);
        }}
        options={appOptions}
        renderInput={(params) => <TextField {...params} />}
        key={appVersion?.app}
      />
    </fieldset>
  );
}
