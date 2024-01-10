import { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { ApplicationVersion } from './application-selector';

interface ApplicationTagProps {
  appVersion: ApplicationVersion;
  onAppTagChange: (appTag: string) => void;
}

export function ApplicationTagSelector({
  appVersion,
  onAppTagChange,
}: ApplicationTagProps) {
  const tagList = useMemo(() => {
    return Object.keys(appVersion.tags);
  }, [appVersion]);

  const _onAppTagChange = (event: unknown, newValue: string) => {
    onAppTagChange(newValue);
  };

  return (
    <fieldset name="application-tag">
      <label>Tag</label>
      <Autocomplete
        disablePortal
        disableClearable={true}
        defaultValue={'latest'}
        onChange={_onAppTagChange}
        options={tagList}
        renderInput={(params) => <TextField {...params} />}
        key={appVersion.app}
      />
    </fieldset>
  );
}
