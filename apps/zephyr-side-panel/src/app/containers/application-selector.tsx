import { useContext } from 'react';
import { Autocomplete, Popper, TextField } from '@mui/material';
// context
import { AppContext } from '../context/app-context';
// icons
import { ArrowDownIcon } from '../../assets/icons';
import { ZeAppVersion } from 'zephyr-edge-contract';
import { type Application } from '../hooks/queries';

interface ApplicationSelectorProps {
  applications: Application[];
  appVersion?: ZeAppVersion;
  onChange: (application: Application) => void;
}

export function ApplicationSelector({
  appVersion,
  applications,
  onChange,
}: ApplicationSelectorProps) {
  const { currentApplication } = useContext(AppContext);
  return (
    <fieldset name="application">
      <label>Name</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={({ ...props }) => (
          <Popper {...props} className="custom-select__popper" />
        )}
        disableClearable={true}
        defaultValue={currentApplication ?? undefined}
        onChange={(_, newApplication) => {
          onChange(newApplication);
        }}
        options={applications.sort(
          (a, b) =>
            -(b.organization.name + b.project.name).localeCompare(
              a.organization.name + a.project.name,
            ),
        )}
        groupBy={(option) =>
          option.organization.name + '/' + option.project.name
        }
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            id={params.id}
            inputProps={params.inputProps}
            InputProps={params.InputProps}
          />
        )}
        key={appVersion?.app}
      />
    </fieldset>
  );
}
