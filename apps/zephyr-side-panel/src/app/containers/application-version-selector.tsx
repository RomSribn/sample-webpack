import { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { ApplicationVersion } from './application-selector';

interface ApplicationVersionProps {
  appVersion: ApplicationVersion;
  onAppVersionChange: (appVersion: string) => void;
}
export function ApplicationVersionSelector({
  appVersion,
  onAppVersionChange,
}: ApplicationVersionProps) {
  const appVersionList = useMemo(() => {
    return appVersion.versions.map((version) => version);
  }, [appVersion]);

  const _onAppVersionChange = (event: unknown, newValue: string) => {
    onAppVersionChange(newValue);
  };

  return (
    <fieldset name="application-version">
      <label>Version</label>
      <Autocomplete
        disableClearable={true}
        defaultValue={appVersion.version}
        onChange={_onAppVersionChange}
        options={appVersionList}
        renderInput={(params) => <TextField {...params as any} />}
        key={appVersion.app}
      />
    </fieldset>
  );
}
