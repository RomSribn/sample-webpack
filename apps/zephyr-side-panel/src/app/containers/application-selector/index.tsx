import { useContext } from 'react';
import { Autocomplete } from '@mui/material';
// components
import { CustomInput } from './custom-input';
import { CustomOption } from './custom-option';
import { CustomPopper } from './custom-popper';
// context
import {
  DataContext,
  PublishDataKeys,
  defaultState,
} from '../../context/data-context';
// icons
import { ArrowDownIcon } from '../../../assets/icons';
import { ZeAppVersion } from 'zephyr-edge-contract';
import { Application } from '../../hooks/queries/application';

interface ApplicationSelectorProps {
  applications: Application[];
  appVersion?: ZeAppVersion;
  onChange: (application: Application) => void;
}

export function ApplicationSelector({
  appVersion,
  applications,
  onChange,
}: Readonly<ApplicationSelectorProps>) {
  const { application, setData } = useContext(DataContext);

  const handleChange = (application: Application) => {
    onChange(application);
    setData(application, PublishDataKeys.APPLICATION);
    setData({}, PublishDataKeys.REMOTES);
    setData(defaultState[PublishDataKeys.TAG], PublishDataKeys.TAG);
  };

  return (
    <fieldset name="application">
      <label>Name</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={CustomPopper}
        disableClearable={true}
        value={application}
        options={applications}
        groupBy={(option) =>
          option.organization.name + '/' + option.project.name
        }
        getOptionLabel={(option) => option.name}
        renderInput={CustomInput}
        // MUI contentEditable prop is not typed properly
        renderOption={(props, option, state, ownerState) => (
          <CustomOption
            renderOptionProps={[
              { ...props, contentEditable: true },
              option,
              state,
              ownerState,
            ]}
            handleChange={handleChange}
          />
        )}
        key={appVersion?.application_uid}
      />
    </fieldset>
  );
}
