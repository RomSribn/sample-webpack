import { useContext, useMemo } from 'react';
// @mui
import { Autocomplete, Popper } from '@mui/material';
// elements, components
import { SelectorSkeleton } from '../../components/selector-skeleton';
import { Input, Option } from './_elements';
// context
import { DataContext, PublishDataKeys } from '../../context/data-context';
// hooks, types
import {
  useApplicationTagList,
  ApplicationTag,
} from '../../hooks/queries/application-tag';
import {
  useApplicationVersionList,
  ApplicationVersion,
} from '../../hooks/queries/application-version';
import { ZeAppVersion } from 'zephyr-edge-contract';
// icons
import { ArrowDownIcon } from '../../../assets/icons';

// necessary to differentiate between tags and version
export const tagKey = 'tag';
export type SelectorOptionType =
  | ApplicationVersion
  | (ApplicationTag & { [tagKey]: string });

interface ApplicationSelectorProps {
  remoteKey: string;
  version: string;
  remote: ZeAppVersion;
  onChange: (newVal: ZeAppVersion | undefined) => void;
  isAppVersionLoading: boolean;
}

export function RemotesSelector({
  remoteKey,
  version,
  remote: __remote,
  onChange: onRemoteChange,
  isAppVersionLoading,
}: Readonly<ApplicationSelectorProps>) {
  const { remotes, setData } = useContext(DataContext);
  const { applicationTagList } = useApplicationTagList(__remote.application_uid);
  const { applicationVersionList } = useApplicationVersionList({ application_uid: __remote.application_uid });

  // necessary to differentiate between tags and version
  const tagList = useMemo<SelectorOptionType[] | undefined>(
    () => applicationTagList?.map((tag) => ({ ...tag, [tagKey]: tag.name })),
    [applicationTagList],
  );

  const options = [...(tagList ?? []), ...(applicationVersionList ?? [])];

  const isDeployed = useMemo(
    () => remotes[__remote.application_uid]?.version === version,
    [__remote.application_uid, remotes, version],
  );

  const onChange = (_: unknown, newValue: ApplicationVersion) => {
    const _remote = version;

    if (!_remote) return;
    setData(
      { ...remotes, [newValue.application_uid]: newValue },
      PublishDataKeys.REMOTES,
    );
    onRemoteChange(newValue);
  };

  if (isAppVersionLoading) return <SelectorSkeleton />;
  if (!__remote) return <SelectorSkeleton />;

  return (
    <fieldset name={remoteKey} className="remotes-root">
      <label>{remoteKey}</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={({ ...props }) => {
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
        groupBy={(option) => (tagKey in option ? 'Tags' : 'Versions')}
        renderGroup={(params) => (
          <li key={params.key} className="MuiList-root">
            <div className="MuiListSubheader-root">{params.group}</div>
            <div className="MuiList-root">{params.children}</div>
          </li>
        )}
        disableClearable={true}
        onChange={onChange}
        options={options}
        getOptionLabel={(option) => option.version}
        defaultValue={__remote as SelectorOptionType}
        renderOption={(props, option) => (
          <Option {...props} option={option} contentEditable="true" />
        )}
        renderInput={(params) => <Input {...params} isDeployed={isDeployed} />}
        key={remoteKey}
      />
    </fieldset>
  );
}
