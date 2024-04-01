import { useState, useContext } from 'react';
import { Autocomplete, Popper, TextField, Box } from '@mui/material';
// components
import { SelectorSkeleton } from '../components/selector-skeleton';
// context
import { DataContext } from '../context/data-context';
// types
import { ZeAppVersionResponse } from 'zephyr-edge-contract';
// icons
import { ArrowDownIcon } from '../../assets/icons';
import { ApplicationEnvironment } from '../hooks/queries/application-environment';

interface EnvironmentSelectorProps {
  environmentList: ApplicationEnvironment[];
  onChange: (environment: ApplicationEnvironment) => void;
  appVersion?: ZeAppVersionResponse;
  isAppVersionLoading: boolean;
}

export function EnvironmentSelector({
  environmentList,
  onChange,
  appVersion,
  isAppVersionLoading,
}: Readonly<EnvironmentSelectorProps>) {
  const { application } = useContext(DataContext);
  const [currentEnvironment, setCurrentEnvironment] =
    useState<ApplicationEnvironment | null>(null);

  // TODO: replace with real link data.
  const renderEnvLink = currentEnvironment && (
    <Box marginTop={1}>
      <a href="customlinkenv.com/dsadasdasd" className="link">
        customlinkenv.com/dsadasdasd
      </a>
    </Box>
  );

  if (isAppVersionLoading) return <SelectorSkeleton />;
  if (!appVersion) return null;

  return (
    <fieldset name="environment">
      <label>Env</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={({ ...props }) => (
          <Popper {...props} className="custom-select__popper" />
        )}
        disableClearable={true}
        onChange={(_, newEnvironment) => {
          setCurrentEnvironment(newEnvironment);
          onChange(newEnvironment);
        }}
        options={environmentList}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            id={params.id}
            inputProps={params.inputProps}
            InputProps={params.InputProps}
          />
        )}
        key={application.name}
      />
      {renderEnvLink}
    </fieldset>
  );
}
