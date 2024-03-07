import { useMemo, useState, useContext } from 'react';
// @mui
import { Popper, Autocomplete } from '@mui/material';
// elements
import { Option, Input } from './_elements';
// context
import { AppContext } from '../../context/app-context';
// icons
import { ArrowDownIcon } from '../../../assets/icons';
import { ZeAppRemoteVersions, ZeAppVersionItem } from 'zephyr-edge-contract';

interface ApplicationSelectorProps {
  remoteKey: string;
  version: string;
  remote: ZeAppRemoteVersions;
  onChange: (
    newVal: { app_uid: string; remote: ZeAppVersionItem } | undefined,
  ) => void;
}

export function RemotesSelector({
  remoteKey,
  version,
  remote,
  onChange: onRemoteChange,
}: ApplicationSelectorProps) {
  const { setIsDeployed } = useContext(AppContext);

  const [selectedVersion, setSelectedVersion] = useState<string>(version);
  const isDeployed = useMemo(
    () => selectedVersion === version,
    [selectedVersion, version],
  );

  const options = useMemo(() => {
    if (!remote) return [];

    const versions = remote.versions;
    const remotes = Object.entries(remote.tags).map(([tagKey, tagValue]) => ({
      tagKey,
      ...tagValue,
    }));

    return [...versions, ...remotes];
  }, [remote]);

  const onChange = (
    _: unknown,
    newValue:
      | ZeAppVersionItem
      | {
          version: string;
          author: string | undefined;
          createdAt: number;
          tagKey: string;
        },
  ) => {
    const _remote = remote?.versions.find(
      (version) => version.version === newValue.version,
    );

    setIsDeployed(newValue.version === version);

    if (!_remote) return;
    setSelectedVersion(newValue.version);
    onRemoteChange({ app_uid: remote.name, remote: _remote });
  };

  return (
    <fieldset name={remoteKey} className="remotes-root">
      <label>{remoteKey}</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={({ ...props }) => {
          console.log('props', props.style);

          return (
            <Popper
              {...props}
              className="custom-select__popper application-group-select"
              style={{
                ...props.style,
                height: '4px',
              }}
            />
          );
        }}
        groupBy={(option) => ('tagKey' in option ? 'Tags' : 'Versions')}
        renderGroup={(params) => (
          <li key={params.key} className="MuiList-root">
            <div className="MuiListSubheader-root">{params.group}</div>
            <div className="MuiList-root">{params.children}</div>
          </li>
        )}
        disableClearable={true}
        defaultValue={remote.versions.find(
          (version) => version.version === remote.currentVersion,
        )}
        onChange={onChange}
        options={options}
        getOptionLabel={(option) => option.version}
        renderOption={(props, option) => (
          <Option {...props} option={option} contentEditable="true" />
        )}
        renderInput={(params) => <Input {...params} isDeployed={isDeployed} />}
        key={remoteKey}
      />
    </fieldset>
  );
}
