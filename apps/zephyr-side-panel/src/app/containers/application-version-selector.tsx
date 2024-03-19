import { useContext } from 'react';
// @mui
import { Popper, TextField, Autocomplete } from '@mui/material';
// context
import { AppContext } from '../context/app-context';
// icons
import { ArrowDownIcon } from '../../assets/icons';
import { ApplicationVersion } from '../hooks/queries/application-version';
// types

interface ApplicationVersionProps {
  applicationVersionList: ApplicationVersion[];
  onAppVersionChange: (applicationVersion: ApplicationVersion) => void;
}
export function ApplicationVersionSelector({
  applicationVersionList,
  onAppVersionChange,
}: ApplicationVersionProps) {
  const { currentApplication } = useContext(AppContext);

  const _onAppVersionChange = (
    _: unknown,
    newAppVersion: ApplicationVersion,
  ) => {
    onAppVersionChange(newAppVersion);
  };

  return (
    <fieldset name="application-version">
      <label>Version</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={({ ...props }) => (
          <Popper {...props} className="custom-select__popper" />
        )}
        disableClearable={true}
        onChange={_onAppVersionChange}
        options={applicationVersionList}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            id={params.id}
            inputProps={params.inputProps}
            InputProps={params.InputProps}
          />
        )}
        key={currentApplication?.id}
      />
    </fieldset>
  );
}
